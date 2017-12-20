//Для отладки
console.log("2.2 Фурнитура (по заказам)");

var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data,
    global_price;
global_price = 0;

var doc_amount,
    doc_products;


function draw_row_name(row_product, table_div, picture) {
    var hide_table = true;
    var table_body = document.createElement("tbody");

    table_body.innerHTML = `
                <tr>
                  <td colspan = '6' style="width:100%" align='center' >#Эскиз#</td>
                </tr>
                <tr>
                  <td colspan = '2' style="width:20%"> Номенклатура </td>
                  <td colspan = '4' style="width:80%">#Номенклатура#</td>
                </tr>
                <tr>
                  <td colspan = '2' style="width:20%"> Характеристика </td>
                  <td colspan = '4' style="width:80%">#Характеристика#</td>
                </tr>
                <tr>
                  <td colspan = '2' style="width:20%"> Размеры </td>
                  <td colspan = '4' style="width:80%">#Размеры#</td>
                </tr>
                <tr>
                  <td colspan = '2' style="width:20%"> Комментарий </td>
                  <td colspan = '4' style="width:80%">#Комментарий#</td>
                </tr>`;

    var table_line = {
        Эскиз: picture,
        Номенклатура: row_product.nom.name,
        Характеристика: row_product.characteristic.name,
        Комментарий: row_product._obj.note,
        Размеры: "  " + row_product.len + " x " + row_product.width + "   мм. x " + row_product.qty.round(2) + "  шт."

    };

    table_body.innerHTML = dhx4.template(table_body.innerHTML, table_line);
    table_div.innerHTML = table_body.innerHTML;
    hide_table = false;


    //Начинаем проверять, есть ли в изделии створки, если есть, то выводим их в таблицу.
    table_row = document.createElement("tr");
    table_row.innerHTML = `
                <td style="width:08%; border-color:black; border-width : 1px; border-style: solid" >№Ств.</td>

                <td colspan = 2  style="width:45%; border-color:black; border-width : 1px; border-style: solid" >Наименование</td>
                <td style="width:15%; border-color:black; border-width : 1px; border-style: solid" >Высота руч.</td>
                <td style="width:12%; border-color:black; border-width : 1px; border-style: solid" >Напр.открывания</td>
                <td style="width:20%; border-color:black; border-width : 1px; border-style: solid" >Размер по фальцу</td>
                `;
    table_div.appendChild(table_row);

    row_product.characteristic.constructions.forEach((ff) => {
        if (ff.furn != $p.utils.blank.guid) {
            table_row = document.createElement("tr");
            table_row.innerHTML = `
                <td style="width:08%; border-color:black; border-width : 1px; border-style: solid" >#constrn#</td>
                <td  colspan = 2 style="width:45%; border-color:black; border-width : 1px; border-style: solid" >#name#</td>
                <td style="width:15%; border-color:black; border-width : 1px; border-style: solid" >#handle_h#</td>
                <td style="width:12%; border-color:black; border-width : 1px; border-style: solid" >#direct#</td>
                <td style="width:30%; border-color:black; border-width : 1px; border-style: solid" >#falce#</td>
                `
            table_line = {
                constrn: ff.cnstr - 1,
                name: ff.furn.name,
                handle_h: ff.h_ruch,
                direct: ff.direction,
                falce: ff.w.round(2) + " x " + ff.h.round(2) + " мм.",
            }
            table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
            table_div.appendChild(table_row);
        }
    })



    return hide_table;
}


function draw_table(o_cc, table_div, nom_grp, use_clr) {

    var noms;
    var hide_table = true;
    switch (nom_grp) {
        case "Фурнитура":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where len = 0 and width = 0 group by nom, characteristic, clr, price", [o_cc]);
            break;
        case "Профиль":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 > 0 and alp2 > 0 group by nom, characteristic, clr, price", [o_cc]);
            break;

        case "Армирование":
            noms = $p.wsql.alasql("select nom, characteristic, price, sum(totqty1) as qty from ? " +
                "where len > 0 and alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;
        case "Заполнение":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;
        case "Заказное заполнение":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty, from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;
        case "Комплектация":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);
            break;
        case "Крепежные элементы":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;
        case "Уплотнитель":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;
        case "Дополнительные профили":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;

        case "Подоконники":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);

            break;
        case "Отливы":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);
            break;
        case "Москитные сетки":
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(s) as qty from ? " +
                "where alp1 = 0 and alp2 = 0 group by nom, characteristic, clr, price", [o_cc]);
            break;

        default:

            break;
    }

    var total_price = 0;
    noms.forEach(function(row) {
        //создаем переменные
        var nom = $p.cat.nom.get(row.nom),
            article = nom.article,
            name = nom.name,
            qty = row.qty,
            clr = $p.cat.clrs.get(row.clr).name,
            base_unit = nom.base_unit.name,
            cx = $p.utils.is_empty_guid(row.characteristic) ? "" : " " + $p.cat.nom.get(row.characteristic, false, true);

        //Если спецификация относится к заданному типу элементов.
        //indexOf - вернет номер элемента, если отличен от -1, то он присутствует.
        //nom_grp - перечисляет типы элементов которые нам необходимо вывести в таблицу
        if ((!!(nom.grouping)) && (nom_grp.indexOf(nom.grouping) != -1)) {

            // Добавляем структуру строки в таблице (внимание к идентификаторам!)
            var table_row = document.createElement("TR");
            if (use_clr) {
                table_row.innerHTML = `<td align='center' colspan='1'>#art#</td>
                                      <td align='left'   colspan='1'>#name#</td>
                                      <td align='center' colspan='1'>#color#</td>
                                      <td align='center' colspan='1'>#price#</td>
                                      <td align='center' colspan='1'>#qty#</td>
                                      <td align='center' colspan='1'>#base#</td>
                                      <td align='center' colspan='1'>#cost#</td>`;
            } else {
                table_row.innerHTML = `<td align='center' colspan='1'>#art#</td>
                                      <td align='left'   colspan='1'>#name#</td>
                                      <td align='center' colspan='1'>#price#</td>
                                      <td align='center' colspan='1'>#qty#</td>
                                      <td align='center' colspan='1'>#base#</td>
                                      <td align='center' colspan='1'>#cost#</td>`;
            }

            //Если площадь равна нулю (заполнения) то ставим длинну
            var table_line = {
                art: article,
                name: name,
                color: clr,
                price: row.price.round(2),
                qty: row.qty.round(2),
                base: base_unit,
                cost: (row.price * row.qty).round(2)
            };

            table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
            table_div.appendChild(table_row);
            total_price += (row.price * row.qty);
            hide_table = false;
        } //if(profiles.indexOf(nom.elm_type.ref) != -1)
    });
    // Итого
    var table_row = document.createElement("TR");
    if (use_clr) {
        table_row.innerHTML = `<td align='center' colspan='6'></td>
                                         <td align='center' colspan='1'>#cost#</td>`;
    } else {
        table_row.innerHTML = `<td align='center' colspan='5'></td>
                                         <td align='center' colspan='1'>#cost#</td>`;
    }
    var total_line = {
        cost: "<b>" + total_price.round(2) + "</b>"
    };
    table_row.innerHTML = dhx4.template(table_row.innerHTML, total_line);
    table_div.appendChild(table_row);
    global_price += total_price;
    return hide_table;
}

function draw_totals(o, table_div) {
    // Итоги документа
    var table_row = document.createElement("TR");
    table_row.innerHTML = `<td align='center' colspan='1'>#total_products#</td>
                                 <td align='center' colspan='1'>#total_cost#</td>
                                 <td align='center' colspan='1'>#document_cost#</td>`;
    var total = {
        total_products: doc_products,
        total_cost: "<b>" + global_price.round(2) + "</b>",
        document_cost: obj.doc_amount
    };
    table_row.innerHTML = dhx4.template(table_row.innerHTML, total);
    table_div.appendChild(table_row);

}

//   Функции закончили, переходим к формированию документа.

// получаем данные печати
return obj.print_data().then((res) => {
        print_data = res;
        doc.put(dhx4.template(templates.header.innerHTML, print_data), templates.header.attributes);
        // получаем объекты продукций
        var aobjs = [];
        obj.production.forEach(function(row) {
            if (!row.characteristic.empty())
                aobjs.push($p.cat.characteristics.get(row.characteristic.ref, true, true));
        });

        return Promise.all(aobjs)
            .then(() => res)
    })
    .then((print_data) => {

        //Признак сокрытия таблицы
        var hide;

        //Выбираем из всей спецификации по всему заказу. Соотв на продукции делить смысла нет
        obj.production.forEach((row) => {

            if (row.characteristic.prod_nom.grouping == '') { // REVIEW: 

                var cc = [];
                row.characteristic.specification.each((sprow) => {
                    cc.push(sprow);
                });

                var tpl_product = document.createElement('div');
                tpl_product = templates.products_all.children.product;

                // табличная часть Изделия
                var tpl_rowname = tpl_product.children.table_row_name.children[0].children[1];
                tpl_product.children.table_row_name.style.display = "inline";
                tpl_product.children.space_row_name.style.display = "block";
                tpl_rowname.innerHTML = "";

                // выводим эскизы и описания продукций
                var tpl_picture = "";
                if (!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {
                    if (print_data.ПродукцияЭскизы[row.characteristic.ref]) {
                        //                    tpl_picture =  $p.iface.scale_svg(print_data.ПродукцияЭскизы[row.characteristic.ref], 450, 0);
                        tpl_picture = $p.iface.scale_svg(print_data.ПродукцияЭскизы[row.characteristic.ref], {
                            height: 320,
                            width: 480,
                            zoom: 0.3
                        }, 0);
                    } else {
                        tpl_picture = "";
                    }
                }

                hide = draw_row_name(row, tpl_rowname, tpl_picture);

                if (hide) {
                    tpl_product.children.table_row_name.innerhtml = "";
                    tpl_product.children.space_row_name.innerhtml = "";
                }

                // табличная часть Фурнитуры
                var tpl_findings = tpl_product.children.table_findings.children[0].children[1];
                tpl_product.children.table_findings.style.display = "inline";
                tpl_product.children.space_findings.style.display = "block";
                tpl_findings.innerHTML = "";

                hide = draw_table(cc, tpl_findings, "Фурнитура", true);
                if (hide) {
                    tpl_product.children.table_findings.innerhtml = "";
                    tpl_product.children.space_findings.innerhtml = "";
                }
                // вывод документа
                doc.put(tpl_product.innerHTML, tpl_product.attributes);
            }  // REVIEW:
        });

        return doc;
    });
