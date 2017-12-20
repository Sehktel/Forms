console.log("Заполнения");
debugger;

const {
    imgs_url
} = $p.job_prm.builder;
var data = [];
var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data;

function draw_spaces(table_div) {
    sp = document.createElement("div")
    sp.innerHTML = "<p, style = 'page-break-after:auto'></p>";
    table_div.appendChild(sp);
}

function draw_fillings(prod_data, table_filling) {
    const product = $p.cat.characteristics.get(prod_data.ref);
    const glassWithLayout = findingLayouts(product);
    let fill = {
        НомерИзделия: product.product,
        Количество: prod_data.Количество,
        НомерЗаказа: product.calc_order.number_doc
    };
    let tbody = document.createElement("tbody");

    if (product.glasses) {
        product.glasses.forEach((row) => {
            let tr = document.createElement("tr");
            tr.innerHTML = `<th style="width:45%;">#НомерЗаказа#/#НомерИзделия#/#Номер#</th>
                <th style="width:30%;">#Формула#</th>
                <th style="width:15%;">#Размер#</th>
				<th style="width:10%;">#Количество#</th>`
            fill.Номер = row._obj.elm;
            fill.Формула = row._obj.formula;
            fill.Размер = row._obj.width.round(0) + 'x' + row._obj.height.round(0);
            tr.innerHTML = dhx4.template(tr.innerHTML, fill);
            tbody.appendChild(tr);
            if (!row.is_rectangular || glassWithLayout.has(row.elm)) {
                const nowdata = data[fill.НомерИзделия - 1];
                if (nowdata && nowdata.glasses) {
                    const img = nowdata.imgs[`g${fill.Номер}`];
                    let tr_svg = document.createElement("tr");
                    tr_svg.innerHTML = `<th style="width:75%;" colspan="2"></th>
    									<th style="width:25%;" colspan="2">Нестандартный стеклопакет</th>`
                    tr_svg.children[0].innerHTML = `<img src="data:image/gif;base64,${img}" style="max-height: 70mm; max-width: 140mm;" />`;
                    tbody.appendChild(tr_svg);
                }
            }
        });
    }
    table_filling.firstElementChild.children[1].innerHTML = tbody.innerHTML;
    table_filling.firstElementChild.children[1].setAttribute('font-weight', 'normal');

    return table_filling;
}

function findingLayouts(product) {
    let glassWithLayout = new Set();
    product.cnn_elmnts.forEach((row) => {
        const elmName = $p.cat.cnns.get(row.cnn).presentation;
        if (elmName.indexOf('Раскладка') != -1) {
            glassWithLayout.add(row.elm2);
        }
    })
    return glassWithLayout;
}

function snake_ref(ref) {
    return '_' + ref.replace(/-/g, '_');
}

// получаем данные печати
return obj.print_data().then((res) => {
    print_data = res;
    return fetch(`${imgs_url}img/doc.calc_order/${obj.ref}?glasses`)
        .then(response => response.json())
        .then(result => {
            // выводим эскизы и описания продукций
            obj.production.forEach(({
                nom,
                characteristic,
                quantity
            }) => {
                data.push(result[snake_ref(characteristic.ref)]);
            });
            // выводим заголовок
            doc.put(dhx4.template(templates.header.innerHTML, print_data), templates.header.attributes);

            //создаем шаблон для описания продукции.
            let products = document.createElement('div');

            for (let i = 0; i < print_data.Продукция.length; i++) {
                //получаем информацию о продукте.
                let prod_data = print_data.Продукция[i];

                let table_filling = document.createElement('div');

                table_filling.innerHTML = templates.table_filling.innerHTML;

                draw_fillings(prod_data, table_filling);

                products.appendChild(table_filling);

                draw_spaces(products);
            }
            //Выводим сформированный шаблон в документ.
            doc.put(products, products.attributes);

            //Выводим нижний колонтитул
            doc.put(templates.footer, templates.footer.attributes);

            return doc;
        })
});
