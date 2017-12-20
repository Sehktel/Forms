var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data;

console.log("Приложение №1");

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

    //из шаблона создаем для него структуру
    // нам этого пока не надо, т.к. в шаблоне у нас таблицы, которые будут положены одна за одной в "дети" данного раздела

    // продукция.
    var production = $p.doc.calc_order.by_ref[obj.ref].production._obj;

    // Есть ли допы, не привязанные к изделиям
    let hasDop = false;
    // создаем html шаблон с описанием допов.
    var dop_info_div = document.createElement("div");
    dop_info_div.setAttribute("style", "page-break-after:auto; display: block;");

    var dop_info = document.createElement("table");
    dop_info.setAttribute("style", "page-break-inside: avoid; width: 100%;");
    dop_info.setAttribute("border", "1");
    dop_info.setAttribute("cellspacing", "0");
    dop_info.innerHTML = `<tr><!--<td colspan="4" style="width: 100%;">Доп. комплектация:</td>--></tr>`;
    let dop_tr = document.createElement('tr');
    dop_tr.innerHTML =
    `<td style="width: 45%;">Номенклатура</td>
    <td style="width: 20%;">Размеры, мм</td>
    <td style="width: 20%;">Колличество, шт.</td>
    <td style="width: 15%;">Цвет</td>`
    // dop_info.firstElementChild.appendChild(dop_tr);

    for (let i = 0; i < print_data.Продукция.length; i++) {
        //получаем информацию о продукте.
        var prod_data = print_data.Продукция[i];
        prod_data.ВсегоПлощадь = prod_data.ВсегоПлощадь.round(2);
        var cc = $p.cat.characteristics.get(prod_data.ref);
        let product = {};
        for (let i = 0; i < production.length; i++) {
            if (prod_data.ref == production[i].characteristic) {
                product = production[i];
            }
        }

        //Если продукт не является наследием, то вытаскиваем его на форму. В противном случае - это доп.
        if ( (product.ordn == $p.utils.blank.guid) && //"00000000-0000-0000-0000-000000000000"
           (print_data.ПродукцияЭскизы[prod_data.ref] != undefined) ) {

            //Добавляем эскиз
            // prod_data.svg = print_data.ПродукцияЭскизы[prod_data.ref]

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

            var glasses = [];
            var ch_glasses = $p.cat.characteristics.get(prod_data.ref);

            if (ch_glasses.glasses) {
                ch_glasses.glasses.forEach((row) => {
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
                var s = "";
                glasses.forEach((row) => {
                    // s += row.f + " (" + row.pos.toString() + ") <br>";
                    s += row.f.replace( ')', 'мм)' ) + "<br>";
                    // s = s.replace( ')', 'мм)' );
                });
                s = s.substring(0, s.length - 4);
                prod_data.Заполнения += s;
            }

            let space_tr = document.createElement('tr');
            space_tr.innerHTML = `<td colspan="4"> <br> </td>`;

            // создаем html шаблон с описанием продукта.
            var product_info_div = document.createElement("div");
            product_info_div.setAttribute("style", "page-break-after:auto; display: block;");

            var product_info = document.createElement("table");
            product_info.setAttribute("style", "page-break-inside: avoid;");
            product_info.setAttribute("border", "1");
            product_info.setAttribute("cellspacing", "0");
            product_info.innerHTML = dhx4.template(templates.products.innerHTML, prod_data);
            product_info.innerHTML += '<p style="page-break-before: auto"></p>';

            for (let i = 0; i < cc.constructions._obj.length; i++) {
                if (cc.constructions._obj[i].furn != '00000000-0000-0000-0000-000000000000') {
                    const cnstr = i + 1;
                    const furName = $p.cat.furns.get(cc.constructions._obj[i].furn).name;
                    // Формирование параметров фурнитуры
                    var furn = {
                        'Ручка': '',
                        'Цвет ручки': '',
                        'ВК': '',
                        'Вент. клапан': '',
                        'Цвет накладок': '',
                        'Ограничиталь откр. 90': '',
                        'Микропроветривание': '',
                        'Детский замок': '',
                        'Микролифт': '',
                        'Профильный цилиндр': '',
                        // 'Средний прижим': '',
                        'Обвязка': '',
                        'Вид петель': '',
                        'Исполнение': ''
                    }; // Словарь Фурнитуры
                    cc.params.each((row) => {
                        if (furn.hasOwnProperty(row.param.presentation) && (row.cnstr == (cnstr))) {
                            furn[row.param.presentation] = row.value.presentation;
                        };
                    });
                    let space_tr = document.createElement('tr');
                    space_tr.innerHTML = `<td colspan="4"> <br> </td>`;
                    let furnname_tr = document.createElement('tr');
                    product_info.children.tbody.insertBefore(space_tr, product_info.children.tbody.children.additionals_tr);
                    furnname_tr.innerHTML = `<td colspan="4">${furName.substring(4)}:</td>`;
                    product_info.children.tbody.insertBefore(furnname_tr, product_info.children.tbody.children.additionals_tr);
                    for (var key in furn) {
                        if ( (furn[key] != '') && (furn[key] != 'Нет') ) {
                            if (key == 'Ручка') {
                                let tr = document.createElement('tr');
                                tr.innerHTML =
                                `<td colspan="1" style="width: 17%;">Ручка:</td>
                                <td colspan="3" style="width: 23%;">${furn['Ручка']}/${furn['Цвет ручки']}</td>`;
                                product_info.children.tbody.insertBefore(tr, product_info.children.tbody.children.additionals_tr);
                            } else if (key != 'Цвет ручки') {
                                let tr = document.createElement('tr');
                                tr.innerHTML =
                                `<td colspan="1" style="width: 17%;">${key}:</td>
                                <td colspan="3" style="width: 23%;">${furn[key]}</td>`;
                                product_info.children.tbody.insertBefore(tr, product_info.children.tbody.children.additionals_tr);
                            }
                        }
                    }
                }
            }

            var add_prod = [];
            //вернули подчиненные элементы, как то доп.комплектующие
            for (var j = i; j < production.length; j++) {
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
            }else {
                product_info.children.tbody.removeChild(product_info.children.tbody.children.additionals_tr)
            }

            //складываем в шаблон формируемого документа
            product_info_div.appendChild(product_info);
            template_products.appendChild(product_info_div);
        }
        if ((product.ordn == $p.utils.blank.guid) && //"00000000-0000-0000-0000-000000000000"
            (cc.prod_nom.grouping != "Услуги") && (print_data.ПродукцияЭскизы[prod_data.ref] == undefined)) {

            let tr = document.createElement('tr');
            tr.innerHTML =
            `<td style="width: 77%;">${prod_data.Номенклатура}</td>
            <td style="width: 15%;">${prod_data.Длинна} x ${prod_data.Ширина}</td>
            <td style="width: 3%;">${prod_data.Количество}</td>
            <td style="width: 5%;">${prod_data.Цвет}</td>`
            dop_info.firstElementChild.appendChild(tr);

            hasDop = true;
        }
    }
    // Закинем допы к конец продукции
    if (hasDop) {
        dop_info.innerHTML += '<p style="page-break-before: auto"></p>';
        dop_info_div.appendChild(dop_info);
        template_products.appendChild(dop_info_div);
    }

    //Выводим сформированный шаблон в документ.
    doc.put(template_products, template_products.attributes);

    //Выводим Окончание документа
    doc.put(dhx4.template(templates.document_end.innerHTML, print_data), templates.document_end.attributes);

    //Выводим Подписи Сдал-Принял
    doc.put(templates.signatures, templates.signatures.attributes);

    //Выводим нижний колонтитул
    doc.put(templates.footer, templates.footer.attributes);

    return doc;

});
