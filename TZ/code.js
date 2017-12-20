var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data;

// console.log("ТЗ");

// получаем данные печати
return obj.print_data().then((res) => {
    debugger;
    print_data = res;
    print_data.ВсегоПлощадьИзделий = print_data.ВсегоПлощадьИзделий.round(2);
    print_data.Офис = $p.doc.calc_order.by_ref[obj.ref].department._presentation;

    // Выводим верхний колонтитул
    doc.put(dhx4.template(templates.header.innerHTML, print_data), templates.header.attributes);
    // выводим заголовок
    doc.put(dhx4.template(templates.document_header.innerHTML, print_data), templates.document_header.attributes);

    //создаем шаблон для описания продукции.
    //создаем для него отдельный div (раздел) в документе
    var template_products = document.createElement("div");

    var production = $p.doc.calc_order.by_ref[obj.ref].production._obj;

    for (let i = 0; i < print_data.Продукция.length; i++) {
        let prod_data = print_data.Продукция[i];
        const characteristic = $p.cat.characteristics.get(prod_data.ref);

        characteristic.specification.forEach(row => {
            const nom = $p.cat.nom.get(row.nom);
            if (nom.grouping == "Профиль") {
                if (nom.elm_type.name == 'Рама') {
                    prod_data.Рама = nom.article;
                } else if (nom.elm_type.name == 'Створка') {
                    prod_data.Створка = nom.article;
                } else if (nom.elm_type.name == 'Импост') {
                    prod_data.Импост = nom.article;
                }
            }
        })

        prod_data.ВсегоПлощадь = prod_data.ВсегоПлощадь.round(2);
        let product = {};
        for (let i = 0; i < production.length; i++) {
            if (prod_data.ref == production[i].characteristic) {
                product = production[i];
            }
        }

        //Если продукт не является наследием, то вытаскиваем его на форму. В противном случае - это доп.
        if ((product.ordn == $p.utils.blank.guid) && //"00000000-0000-0000-0000-000000000000"
            (print_data.ПродукцияЭскизы[prod_data.ref] != undefined)) {

            //Добавляем эскиз
            if (print_data.ПродукцияЭскизы[prod_data.ref]) {
                prod_data.svg = $p.iface.scale_svg(print_data.ПродукцияЭскизы[prod_data.ref], {
                    height: 350,
                    width: 450,
                    zoom: 0.5
                }, 0);
            } else
                prod_data.svg = "";

            //Формируем структуру с заполнениями;
            //Если мы найдем одинаковые стеклопакеты (стекла), то посчитаем и положим номер элемента в массив
            let glasses = [];
            if (characteristic.glasses) {
                characteristic.glasses.forEach((row) => {
                    const {
                        formula
                    } = row._obj;
                    const {
                        elm
                    } = row._obj;
                    let t = (glasses.find((add) => {
                        return add.f == formula;
                    }));
                    if (t) {
                        t.pos.push(elm);
                    } else {
                        glasses.push({
                            f: formula,
                            pos: [elm]
                        });
                    }
                });
                //Переводим структуру в строку
                let s = "";
                glasses.forEach((row) => {
                    s += row.f.replace(')', 'мм)') + "<br>";
                });
                s = s.substring(0, s.length - 4);
                prod_data.Заполнения += s;
            }

            let space_tr = document.createElement('tr');
            space_tr.innerHTML = `<td colspan="4"> <br> </td>`;

            var product_info_div = document.createElement("div");
            product_info_div.setAttribute("style", "page-break-after:auto; display: block;");

            var product_info = document.createElement("table");
            product_info.setAttribute("style", "page-break-inside: avoid;");
            product_info.setAttribute("border", "1");
            product_info.setAttribute("cellspacing", "0");
            product_info.innerHTML = dhx4.template(templates.products.innerHTML, prod_data);
            product_info.innerHTML += '<p style="page-break-before: auto"></p>';

            let add_prod = [];
            //вернули подчиненные элементы, как то доп.комплектующие
            for (let j = i; j < production.length; j++) {
                if (production[j].ordn == prod_data.ref) {
                    add_prod.push(print_data.Продукция[j]);
                }
            }

            //если что-то есть, то складываем в таблицу доп.комплектации
            if (add_prod.length > 0) {
                product_info.children.tbody.insertBefore(space_tr, product_info.children.tbody.children.additionals_tr);
                add_prod.forEach((row) => {
                    let tr = document.createElement('tr');
                    tr.innerHTML =
                        `<td style="width: 17%;">${row.Номенклатура}</td>
                    <td style="width: 15%;">${row.Длинна} x ${row.Ширина}</td>
                    <td style="width: 3%;">${row.Количество}</td>
                    <td style="width: 5%;">${row.Цвет}</td>`
                    product_info.children.tbody.appendChild(tr)
                });
            } else {
                product_info.children.tbody.removeChild(product_info.children.tbody.children.additionals_tr)
            }

            //складываем в шаблон формируемого документа
            product_info_div.appendChild(product_info);
            template_products.appendChild(product_info_div);
        }
    }

    //Выводим сформированный шаблон в документ.
    doc.put(template_products, template_products.attributes);

    //Выводим Окончание документа
    // doc.put(dhx4.template(templates.document_end.innerHTML, print_data), templates.document_end.attributes);

    //Выводим Подписи Сдал-Принял
    doc.put(templates.signatures, templates.signatures.attributes);

    //Выводим нижний колонтитул
    doc.put(templates.footer, templates.footer.attributes);

    return doc;

});
