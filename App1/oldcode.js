var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data;

console.log("Приложение №1");

// Выводим верхний колонтитул
doc.put(templates[0], templates[0].attributes);

// получаем данные печати
return obj.print_data().then((res) => {
    debugger;
    print_data = res;
    print_data.ВсегоПлощадьИзделий = print_data.ВсегоПлощадьИзделий.round(2);
    print_data.Офис = $p.doc.calc_order.by_ref[obj.ref].department._presentation;
    // выводим заголовок
    doc.put(dhx4.template(templates.document_header.innerHTML, print_data), templates.document_header.attributes);

    //создаем шаблон для описания продукции.
    //создаем для него отдельный div (раздел) в документе
    var template_products = document.createElement("div");
    //template_products.setAttribute("style", "page-break-inline:auto; display: block;");

    //из шаблона создаем для него структуру
    // нам этого пока не надо, т.к. в шаблоне у нас таблицы, которые будут положены одна за одной в "дети" данного раздела
    // template_products.innerHTML = templates.products.children[0].outerHTML;

    // Дополнительная продукция.
    var add_prod = [];
    var production = $p.doc.calc_order.by_ref[obj.ref].production._obj;

    //Сортируем продукцию, с тем, чтобы водоотливы были внизу. Для красоты.

    // print_data.Продукция.sort(function(a, b) {
    //     var noma = a.Номенклатура,
    //         nomb = b.Номенклатура;
    //     if (noma == "Водоотлив") {
    //         return 1
    //     };
    //     if (nomb == "Водоотлив") {
    //         return -1
    //     };
    //     return 0;
    // });

    for (var i = 0; i < print_data.Продукция.length; i++) {
        //получаем информацию о продукте.
        var prod_data = print_data.Продукция[i];
        prod_data.ВсегоПлощадь = prod_data.ВсегоПлощадь.round(2);
        var cc = $p.cat.characteristics.get(production[prod_data.НомерСтроки - 1].characteristic);

        //Если продукт не является наследием, то вытаскиваем его на форму. В противном случае - это доп.
        if ((production[prod_data.НомерСтроки - 1].ordn == $p.utils.blank.guid) && //"00000000-0000-0000-0000-000000000000"
        (cc.prod_nom.nom_type.presentation == 'Товар, материал')) {

            // Формирование параметров фурнитуры
            furName = furParam = "";
            cc.params.each((row) => {
                if ((!row._obj.hide) && row.value.presentation && (row.value.presentation != "Нет")) {
                    furName += row.param.presentation + ': <br>';
                    furParam += row.value.presentation + '<br>';
                };
            });
            prod_data.ПараметрыФурнитуры = furName + '</td><td style="width: 22%;" colspan="1">' + furParam;

            //Добавляем эскиз
            prod_data.svg = print_data.ПродукцияЭскизы[prod_data.ref]

            if (print_data.ПродукцияЭскизы[prod_data.ref]) {
                prod_data.svg = $p.iface.scale_svg(print_data.ПродукцияЭскизы[prod_data.ref], {
                    height: 220,
                    width: 280,
                    zoom: 0.14
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
                    s += row.f + "<br>";
                });
                s = s.substring(0, s.length - 4);
                prod_data.Заполнения += s;
            } //заполнения

            //Создали дополнительную строку с Доп.комплектацией.
            prod_data.Допкомплектация = "";
            //вернули подчиненные элементы, как то доп.комплектующие
            for (var j = i; j < production.length; j++) {
                if (production[j].ordn == prod_data.ref) {
                    add_prod.push(print_data.Продукция[j]);
                }
            }

            // add_prod = production.filter(function(data) {
            //     return data.ordn == prod_data.ref
            // });

            //если что-то есть, то складываем в таблицу доп.комплектации
            if (add_prod.length > 0) {
                //console.log("add additionals");
                var adds = "";
                add_prod.forEach((row) => {
                    adds += row.Номенклатура + " " + row.Длинна.round(0) + "x" + row.Ширина.round(0) + ", " + row.ВсегоПлощадь.round(2) + "м² " + row.Количество + " " + row.Ед + "<br>"
                });
                adds = adds.substring(0, adds.length - 4);
                prod_data.Допкомплектация = adds;
            } else {
                prod_data.Допкомплектация = "";
            }

            // очищаем массив доп.продукции
            add_prod = [];

            // создаем html шаблон с описанием продукта.
            var product_info_div = document.createElement("div");
            product_info_div.setAttribute("style", "page-break-after:auto; display: block;");

            var product_info = document.createElement("table");
            product_info.setAttribute("style", "page-break-inside: avoid;"); //border-style: solid;

            product_info.innerHTML = dhx4.template(templates.products.innerHTML, prod_data);
            product_info.innerHTML += '<p style="page-break-before: auto"></p>';

            //Заполнений нет, скрываем строку
            // if (prod_data.Заполнения.length == 0) {
            //     product_info.children[0].prof_glass_tr.glass_tr.style.color = "white";
            // }

            //Если фурнитуры нет, скрываем строку
            // if (prod_data.Фурнитура.length == 0) {
            //     product_info.children[0].children.furn_tr.style.color = "white";
            // }

            //Если Допкомплектующих нет, скрываем строку
            if (prod_data.Допкомплектация.length == 0) {
                product_info.children[0].children.additionals_tr.style.color = "white";
            }

            //складываем в шаблон формируемого документа
            product_info_div.appendChild(product_info);
            template_products.appendChild(product_info_div);
        }
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
