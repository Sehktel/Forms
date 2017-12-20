debugger;

const {
    imgs_url
} = $p.job_prm.builder;
if (!imgs_url) {
    $p.msg.show_msg({
        type: 'alert-warning',
        text: 'Не заполнена константа "imgs_url"',
        title: 'Сервис эскизов'
    });
    return Promise.resolve();
}
const templates = this._template.content.children;
const doc = new $p.SpreadsheetDocument();

// форматирование ref изделия
function snake_ref(ref) {
    return '_' + ref.replace(/-/g, '_');
}

// получаем данные печати
return fetch(`${imgs_url}img/doc.calc_order/${obj.ref}?glasses`)
    .then(response => response.json())
    .then(res => {

        // выводим заголовок
        doc.put(dhx4.template(templates.header.innerHTML, res), templates.header.attributes);

        // выводим эскизы и описания продукций
        const tpl_product = templates.product;
        obj.production.forEach(({
            nom,
            characteristic,
            quantity
        }) => {
            const data = res[snake_ref(characteristic.ref)];
            if (data && data.glasses) {
                for (const glass of data.glasses) {
                    const img = data.imgs[`g${glass.elm}`];
                    if (img) {
                        tpl_product.children[0].innerHTML = `<img src="data:image/gif;base64,${img}" style="max-height: 70mm; max-width: 90mm;" />`;
                        tpl_product.children[1].innerHTML = `${data.name}, ${quantity}шт<br/><br/>${glass.formula}`;
                        doc.put(tpl_product.innerHTML, tpl_product.attributes);
                    }
                }
            }
        });

        return doc;
    })
    .catch(err => {
        // сообщение об ошибке при неудачном запросе
        $p.msg.show_msg({
            type: "alert-warning",
            text: err.message,
            title: "Сервис эскизов"
        });
        $p.record_log(err);
    });
