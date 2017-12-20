//console.log("Итоговая подробная (по изделиям)");
debugger;
var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data,
    global_price = 0,
    all_price = 0,
    all_first_cost = 0,
    first_cost = 0;

var doc_amount,
    doc_products,
    p = obj.production,
    sort_noms = [],
    svgs = [],
    date = ["",""];

//Доступные роли
let roles = [];

//Собрать роли из Параметров, начиная со второго
for (var i = 1; i < this.params._obj.length; i++) {
    roles.push(this.params.get(i).value);
}

//Собрать доступность ролей по условию И
var access = true;
roles.some((row) => {
    access = access && $p.current_user.role_available(row);
});

function sortingNoms(nom_sort, noms) {
    function compareArt(a, b) {
        if (a.nom.article > b.nom.article) return 1;
        if (a.nom.article < b.nom.article) return -1;
    }
    for (let i = 0; i < nom_sort.length; i++) {
        sort_noms[nom_sort[i]] = [];
        for (let j = 0; j < noms.length; j++) {
            if (noms[j].nom.grouping == nom_sort[i]) {
                sort_noms[nom_sort[i]].push(noms[j]);
            }
        }
        sort_noms[nom_sort[i]].sort(compareArt);
    }
    return sort_noms;
}

function sort_cc(arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        if (arr[i] != "") {
            obj[str] = true; // запомнить строку в виде свойства объекта
        }
    }
    return Object.keys(obj); // или собрать ключи перебором для IE8-
}

function draw_table(table_div, nameGrouping, groupingNoms) {
    var total_price = 0;
    groupingNoms.forEach(function(row, i, groupingNoms) {

        // Добавляем структуру строки в таблице (внимание к идентификаторам!)
        var table_row = document.createElement("TR");
        if (access) {
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
                                <td align='center' colspan='1'>#color#</td>
                                <td align='center' colspan='1'>#qty#</td>
                                <td align='center' colspan='1'>#base#</td>`;
        }

        //Если площадь равна нулю (заполнения) то ставим длинну
        var table_line = {
            art: row.nom.article,
            name: row.nom.name,
            color: row.clr.presentation,
            price: row.price.round(2),
            qty: row.qty.round(2),
            base: row.nom.base_unit._presentation,
            cost: (row.price * row.qty).round(2)
        };
        table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
        let tt_table = table_div.children.table_grouping.firstElementChild;
        tt_table.tBodies[0].appendChild(table_row);
        total_price += table_line.cost;
    });
    // Итого
    var table_row = document.createElement("TR");
    if (access) {
        table_row.innerHTML = `<td align='center' colspan='6'></td>
    						 <td align='center' colspan='1'>#cost#</td>`;
    }
    var total_line = {
        cost: "<b>" + total_price.round(2) + "</b>"
    };

    table_row.innerHTML = dhx4.template(table_row.innerHTML, total_line);
    let tt_table = table_div.children.table_grouping.firstElementChild;
    tt_table.tBodies[0].appendChild(table_row);
    global_price += total_price;
    all_price += total_price;
    return 1;
}

function draw_row_name(row_product, table_div){
    var table_body = document.createElement("div");
    table_body.innerHTML =`
    <table style="width: 80%; margin:0 auto; border-top: 2px solid black; border-bottom: 2px solid black;">
        <tbody>
            <tr>
                <td id="svg" rowspan="3" style="width: 30%; height: 180px; text-align:center">#svg#</td>
                <td style="width:20%"> Номенклатура </td>
                <td>#Номенклатура#</td>
            </tr>
            <tr>
                <td style="width:20%"> Характеристика </td>
                <td>#Характеристика#</td>
            </tr>
            <tr>
                <td style="width:20%"> Размеры </td>
                <td>#Размеры#</td>
            </tr>
        </tbody>
    </table>`;

    var table_line = {
            Номенклатура: row_product.nom.name,
            Характеристика : row_product.characteristic.name,
            Размеры: "  " + row_product.len + " x " + row_product.width + "   мм. x " + row_product.qty.round(2) + "  шт."
        };
        if (svgs[row_product.characteristic.ref]) {
            table_line.svg = $p.iface.scale_svg(svgs[row_product.characteristic.ref], {
                        height: 220,
                        width: 280,
                        zoom: 0.14
                }, 0)
        } else {
            table_line.svg = "";
        }

    table_body.innerHTML = dhx4.template(table_body.innerHTML, table_line);
    return table_body;
}

//   Функции закончили, переходим к формированию документа.

// получаем данные печати
return obj.print_data().then((res) => {
        print_data = res;
        doc.put(dhx4.template(templates.header.innerHTML, print_data), templates.header.attributes);
        date[0] = print_data.ДатаЗаказаФорматD;
        date[1] = print_data.ДатаТекущаяФорматD;
        for (var svg in res.ПродукцияЭскизы) {
            if (res.ПродукцияЭскизы.hasOwnProperty(svg)) {
                svgs[svg] = res.ПродукцияЭскизы[svg];
            }
        }
    })
    .then((print_data) => {

        //В cc мы получаем всю спецификацию на весь заказ с учетом кол-ва продукции!
        var count = p._obj.length;
        var tpl_all = document.createElement('div');
        p.forEach((row) => {
            var cc = [];
            global_price = 0;
            all_first_cost += row.first_cost;
            first_cost = row.first_cost;
            row.characteristic.specification.each((sprow) => {
                cc.push(sprow);
            });

            var noms;
            noms = $p.wsql.alasql("select nom, characteristic, clr, price, sum(totqty1) as qty from ? " +
                "group by nom, characteristic, clr, price", [cc]);
            var cc_nom = [];
            for (let i = 0; i < cc.length; i++) {
                cc_nom[i] = cc[i].nom.grouping;
            }
            nom_sort = sort_cc(cc_nom);
            sort_noms = sortingNoms(nom_sort, noms);

            var tpl_product = document.createElement('div');
            tpl_product.innerHTML = templates.products_all.children.product.innerHTML;
            var tpl_rowname = document.createElement('div');
            tpl_product.appendChild(draw_row_name(row, tpl_rowname));
            for (var i = 0; i < nom_sort.length; i++) {
                // табличная часть Группировка
                var tpl_grouping = document.createElement('div');
                if (access) {
                    tpl_grouping.innerHTML = `<div id = "space_grouping" margin="5" style="display:block">
    											<p><b>` + nom_sort[i] + `</b></p>
    									      	</div>
    										      <!-- Табличная часть Группировка -->
    											      <div id='table_grouping' class = 'container' style="display:table">
    											         <table class="border" width="100%" cellpadding="2" cellspacing="2">
    											            <thead>
    											               <tr class="grouping_head">
                                                                  <th style="width:17%;">Артикул</th>
                                                                  <th style="width:40%;">Наименование</th>
    											                  <th style="width:10%;">Цвет</th>
    											                  <th style="width:8%;">Цена</th>
    											                  <th style="width:8%;">Кол-во</th>
    											                  <th style="width:7%;">Ед.Изм</th>
    											                  <th style="width:10%;">Стоимость</th>
    											               </tr>
    											            </thead>
    											            <tbody>
    											            </tbody>
    											         </table>
    											      </div>`;
                } else {
                    tpl_grouping.innerHTML = `<div id = "space_grouping" margin="5" style="display:block">
    											<p><b>` + nom_sort[i] + `</b></p>
    									      	</div>
    										      <!-- Табличная часть Группировка -->
    											      <div id='table_grouping' class = 'container' style="display:table">
    											         <table class="border" width="100%" cellpadding="2" cellspacing="2">
    											            <thead>
    											               <tr class="grouping_head">
                                                                  <th style="width:17%;">Артикул</th>
                                                                  <th style="width:40%;">Наименование</th>
    											                  <th style="width:10%;">Цвет</th>
    											                  <th style="width:8%;">Кол-во</th>
    											                  <th style="width:7%;">Ед.Изм</th>
    											               </tr>
    											            </thead>
    											            <tbody>
    											            </tbody>
    											         </table>
    											      </div>`;
                }
                draw_table(tpl_grouping, nom_sort[i], sort_noms[nom_sort[i]]);
                tpl_product.appendChild(tpl_grouping);
            }
            var table_totals = document.createElement("div");
            if (count - 1) {
                table_totals.style.pageBreakAfter = "always";
                count--;
            }
            if (access) {
                table_totals.innerHTML = `
                    <table class="border" width="100%" cellpadding="2" cellspacing="2">
                    <tbody>
                        <tr margin="5">_</tr>
                        <tr>
                            <td style="width:89%;"><b>Итоговая изделия:</b></td>
                            <td style="width:11%;">#firstcost#</td>
                            <td style="width:11%;">#cost#</td>
                        </tr>
                    </tbody>
                    </table>`;
            }
            var total_line = {
                cost: "<b>" + global_price.round(2) + "</b>",
                firstcost: "<i>" + first_cost.round(2) + "</i>"
            };

            table_totals.innerHTML = dhx4.template(table_totals.innerHTML, total_line);
            tpl_product.appendChild(table_totals);
            // вывод документа
            // doc.put(tpl_product.innerHTML, tpl_product.attributes);
            tpl_all.innerHTML += tpl_product.innerHTML;
        });
        var all_totals = document.createElement("div");
        if (access) {
            all_totals.innerHTML = `
                <table class="border" width="100%" cellpadding="2" cellspacing="2">
                <tbody>
                    <tr margin="5">_</tr>
                    <tr>
                        <td style="width:78%;"><b>Итоговая документа:</b></td>
                        <td style="width:11%;">#firstcost#</td>
                        <td style="width:11%;">#cost#</td>
                    </tr>
                </tbody>
                </table>
                <table class="border" width="100%" cellpadding="2" cellspacing="2">
                <tbody>
                    <tr margin="5">_</tr>
                    <tr>
                        <td style="width:35%;"><b>Дата формирования счета:</b></td>
                        <td style="width:15%;">#date0#</td>
                        <td style="width:35%;"><b>Дата печати:</b></td>
                        <td style="width:15%;">#date1#</td>
                    </tr>
                </tbody>
                </table>`;
        }
        var total_line = {
            cost: "<b>" + all_price.round(2) + "</b>",
            firstcost: "<i>" + all_first_cost.round(2) + "</i>",
            date0: date[0],
            date1: date[1]
        };

        all_totals.innerHTML = dhx4.template(all_totals.innerHTML, total_line);
        tpl_all.appendChild(all_totals);
        doc.put(tpl_all.innerHTML, tpl_all.attributes);
        return doc;
    });
