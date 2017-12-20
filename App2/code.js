//Определяем входные переменные
var templates = this._template.content.children,
    doc = new $p.SpreadsheetDocument(),
    print_data;


//Информация для отладки
console.log("4.2 Приложение №2");
debugger;

function add_zero(str_in) {
    let str_out;
    switch ((str_in.length - 1) - str_in.indexOf(',')) {
        case 1:
            if (str_in == '0') {
                str_out = str_in + ",00";
            } else {
                str_out = str_in + "0";
            }
            break;
        case 2:
            str_out = str_in;
            break;
        case 3:
            str_out = str_in + ",00";
            break;
        default:
            str_out = str_in;
            break;
    }
    return str_out;
}
// Выводим верхний колонтитул
doc.put(templates[0], templates[0].attributes);

// получаем данные печати
return obj.print_data().then((res) => {
    print_data = res;

    var myorder = $p.doc.calc_order.by_ref[obj.ref];

    var mynoms = [],
        service = [];

    myorder.production._obj.forEach((row) => {
        if ($p.cat.nom.get(row.nom).nom_type.name == 'Услуга') {
            mynoms.push($p.cat.nom.get(row.nom));
            service.push(row);
        }
    });

    //Добавим кол-во конструкций, чтобы отличать доп.профиля от основных изделий.
    print_data.Продукция.forEach((row) => {
        let cc = $p.cat.characteristics.get(row);
        row.Конструкции = cc.constructions._obj.length;
        let d = $p.doc.calc_order.get(cc.calc_order);
        print_data.Офис = d.department.presentation;
    });

    print_data.Изделия = print_data.Продукция.filter((r) => {
        return r.Конструкции >= 1 ? 1 : 0
    }); //Если есть конструкции, то изделия
    print_data.ДопПродукция = print_data.Продукция.filter((r) => {
        return r.Конструкции >= 1 ? 0 : 1
    });

    print_data.Услуги = [];

    for (let i = 0; i < service.length; i++) {
        print_data.Услуги[i] = {
            ref:"",
            ВсегоПлощадь:+service[i].s,
            Габариты:"",
            Длинна: +service[i].len,
            Ед: service[i].qty,
            Заполнения:"",
            Количество:service[i].quantity,
            Конструкции:1,
            Номенклатура: mynoms[i].name,
            НомерСтроки:service[i].row,
            ОбщаяПлощадь:"",
            Описание: mynoms[i]._grouping,
            Параметры:[],
            Площадь:+service[i].s,
            Примечание:"",
            Размеры:"",
            Скидка:0,
            СкидкаПроцент:service[i].discount_percent,
            СкидкаПроцентВнутр:service[i].discount_percent_internal,
            Сумма: service[i].amount,
            СуммаВнутр:service[i].amount_internal,
            Фурнитура:"",
            Характеристика:service[i].characteristic.name,
            Цвет:"",
            Цена: service[i].price,
            ЦенаБезСкидки:"",
            ЦенаВнутр:service[i].price_internal,
            Ширина: service[i].width
        };
        for (var j = 0; j < print_data.ДопПродукция.length; j++) {
            if (print_data.ДопПродукция[j].ref == service[i].characteristic) {
                print_data.ДопПродукция.splice(j, 1)
            }
        }
    };

    // Итоговая документа
    let allTotals = {
        'СредняяСкидка': 0,
        'БезСкидки': 0,
        'СоСкидкой': 0
    };

    //Выполним запрос, чтобы определить суммы площадей изделий в зависимости от материала профиля и наличия конструкций
    //let ress =alasql('SELECT `Номенклатура`, SUM(`Цена`) AS `Цена`, SUM(`Площадь`) AS `Площадь`, SUM(`Количество`) AS `Количество`, AVG(`СкидкаПроцент`) AS `СредняяСкидка`, SUM(`Сумма`) AS `ЦенаСоСкидкой` FROM ?  WHERE `Конструкции` > 0 GROUP BY `Номенклатура` ORDER BY `Номенклатура` DESC',[print_data.Продукция]);
    //        let ress =alasql('SELECT `Номенклатура`, SUM(`Цена`) AS `Цена`, SUM(`Площадь`) AS `Площадь`, SUM(`Количество`) AS `Количество`, AVG(`СкидкаПроцент`) AS `СредняяСкидка`, SUM(`Сумма`) AS `ЦенаСоСкидкой` FROM ?  WHERE `Конструкции` > 0 GROUP BY `Номенклатура` ORDER BY `Номенклатура` DESC',[print_data.Продукция]);


    // выводим заголовок
    doc.put(dhx4.template(templates.document_header.innerHTML, print_data), templates.document_header.attributes);

    //создаем шаблон для описания продукции.
    //создаем для него отдельный div (раздел) в документе

    // Строка таблицы product info

    let head_pi_innerHTML = '\
        <tr>\
            <td colspan="7" align="left"   bgcolor="b1b1b1" > Изделия </td>\
            <td colspan="1" align="right" bgcolor="b1b1b1" > Кол-во шт. </td>\
            <td colspan="1" align="right" bgcolor="b1b1b1" > Площадь кв.м. </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Цена <br> без скидки </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Скидка % </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Сумма </td>\
        </tr>';

    let head_dop_pi_innerHTML = '\
        <tr>\
            <td colspan="7" align="left"   bgcolor="b1b1b1" > Доп. комплектация </td>\
            <td colspan="1" align="right" bgcolor="b1b1b1" > Кол-во шт. </td>\
            <td colspan="1" align="right" bgcolor="b1b1b1" > Площадь кв.м. </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Цена <br> без скидки </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Скидка % </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Сумма </td>\
        </tr>';

    let head_serv_pi_innerHTML = '\
        <tr>\
            <td colspan="7" align="left"   bgcolor="b1b1b1" > Услуги </td>\
            <td colspan="1" align="right" bgcolor="b1b1b1" > Кол-во шт. </td>\
            <td colspan="1" align="right" bgcolor="b1b1b1" > Площадь кв.м. </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Цена <br> без скидки </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Скидка % </td>\
            <td colspan="2" align="right" bgcolor="b1b1b1" > Сумма </td>\
        </tr>';


    //<td colspan="1" align="center" bgcolor="" > #НомерСтроки# </td> \
    let pi_innerHTML = '<tr> \
            <td colspan="2" align="left"   bgcolor="white" > #Номенклатура# </td> \
            <td colspan="1" align="right" bgcolor="white" > #Цвет# </td> \
            <td colspan="1" align="right" bgcolor="white" > #Длинна# </td> \
            <td colspan="1" align="center" bgcolor="white" > x </td> \
            <td colspan="1" align="right" bgcolor="white" > #Ширина# </td> \
            <td colspan="1" align="right" bgcolor="white" > #Площадь# </td> \
            <td colspan="1" align="right" bgcolor="white" > #Количество# </td> \
            <td colspan="1" align="right" bgcolor="white" > #ОбщаяПлощадь# </td> \
            <td colspan="2" align="right" bgcolor="white" > #ЦенаБезСкидки# </td> \
            <td colspan="2" align="right" bgcolor="white" > #СкидкаПроцент# </td> \
            <td colspan="2" align="right" bgcolor="white" > #Сумма# </td> \
        </tr>';

    let pi_blank_innerHTML = '<tr> <td colspan = "15" > &nbsp; </td> </tr>';

    let pi_total_innerHTML = '\
        <tr">\
            <td colspan="7" align="left"   bgcolor="white" > Всего: </td>\
            <td colspan="1" align="right" bgcolor="white" > #ИтогоКоличество# </td>\
            <td colspan="1" align="right" bgcolor="white" > #ИтогоПлощадь# </td>\
            <td colspan="2" align="right" bgcolor="white" > #ИтогоЦенаБезСкидок# </td>\
            <td colspan="2" align="right" bgcolor="white" > #СредняяСкидка#  </td>\
            <td colspan="2" align="right" bgcolor="white" > #ИтогоСумма# </td>\
        </tr>';

    let pi_dop_total_innerHTML = '\
        <tr">\
            <td colspan="7" align="left"   bgcolor="white" > Всего: </td>\
            <td colspan="1" align="right" bgcolor="white" > #ИтогоКоличество# </td>\
            <!-- <td colspan="1" align="right" bgcolor="white" > #ИтогоПлощадь# </td> -->\
            <td colspan="3" align="right" bgcolor="white" > #ИтогоЦенаБезСкидок# </td>\
            <td colspan="2" align="right" bgcolor="white" > #СредняяСкидка#  </td>\
            <td colspan="2" align="right" bgcolor="white" > #ИтогоСумма# </td>\
        </tr>';


    let pi_serv_total_innerHTML = '\
        <tr">\
            <td colspan="7" align="left"   bgcolor="white" > Всего: </td>\
            <td colspan="1" align="right" bgcolor="white" > #ИтогоКоличество# </td>\
            <!-- <td colspan="1" align="right" bgcolor="white" > #ИтогоПлощадь# </td> -->\
            <td colspan="3" align="right" bgcolor="white" > #ИтогоЦенаБезСкидок# </td>\
            <td colspan="2" align="right" bgcolor="white" > #СредняяСкидка#  </td>\
            <td colspan="2" align="right" bgcolor="white" > #ИтогоСумма# </td>\
        </tr>';


    //Начинаем фомировать таблицы
    //Создаем div в который "завернем" таблицу
    let template_products = document.createElement("div");
    template_products.innerHTML += templates.products.innerHTML;

    if (print_data.Изделия.length) {
        //Сортируем в алфавитном порядке
        print_data.Изделия = print_data.Изделия.sort(function(obj1, obj2) {
            let compA = obj1.Номенклатура.toUpperCase();
            let compB = obj2.Номенклатура.toUpperCase();
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });
        // создаем html шаблон с описанием продукта.
        let product_head = document.createElement("tr");

        product_head.innerHTML = head_pi_innerHTML;

        template_products.children[0].tBodies[0].append(product_head);

        //Создаем объект с Итоговыми значениями
        let total_products_obj = {};
        total_products_obj.ИтогоКоличество = 0;
        total_products_obj.ИтогоПлощадь = 0;
        total_products_obj.ИтогоЦена = 0;
        total_products_obj.ИтогоСумма = 0;
        total_products_obj.ВсегоПозиций = 0;
        total_products_obj.СредняяСкидка = 0;
        total_products_obj.ИтогоЦенаБезСкидок = 0;

        for (let i = 0; i < print_data.Изделия.length; i++) {

            // if ((i==0)||(print_data.Изделия[i].Номенклатура != print_data.Изделия[i-1].Номенклатура)){
            //     template_products = document.createElement("div");
            //     template_products.innerHTML += templates.products.innerHTML;
            //     template_products.innerHTML = dhx4.template(template_products.innerHTML, print_data.Изделия[i]);
            // }
            //получаем информацию о продукте.
            let prod_data = print_data.Изделия[i];
            prod_data.Описание = prod_data.Номенклатура + " " + prod_data.Цвет + " " + prod_data.Размеры;

            prod_data.Габариты = prod_data.Длинна + " x " + prod_data.Ширина
            prod_data.ОбщаяПлощадь = prod_data.Количество * prod_data.Площадь;
            prod_data.ОбщаяПлощадь = prod_data.ОбщаяПлощадь.round(2);
            prod_data.ЦенаБезСкидки = (prod_data.Цена * prod_data.Количество).round(0);
            //Накопим результат
            total_products_obj.ИтогоКоличество += prod_data.Количество;
            total_products_obj.ИтогоПлощадь += prod_data.ОбщаяПлощадь;
            total_products_obj.ИтогоЦена += prod_data.Цена;
            total_products_obj.ИтогоСумма += prod_data.Сумма.round(0);
            total_products_obj.ВсегоПозиций = print_data.Изделия.length;
            total_products_obj.ИтогоЦенаБезСкидок += prod_data.Цена.round(0) * prod_data.Количество;

            prod_data.Цена = add_zero(prod_data.Цена.toLocaleString('ru-RU'));
            prod_data.Площадь = add_zero(prod_data.Площадь.round(2).toLocaleString('ru-RU'));
            prod_data.ОбщаяПлощадь = add_zero(prod_data.ОбщаяПлощадь.toLocaleString('ru-RU'));
            prod_data.Сумма = add_zero(prod_data.Сумма.round(0).toLocaleString('ru-RU'));
            prod_data.ЦенаБезСкидки = add_zero(prod_data.ЦенаБезСкидки.toLocaleString('ru-RU'));

            // создаем html шаблон с описанием продукта.
            let product_info = document.createElement("tr");

            product_info.innerHTML = pi_innerHTML;

            product_info.innerHTML = dhx4.template(product_info.innerHTML, prod_data);
            template_products.children[0].tBodies[0].append(product_info);

            // let j = i + 1;
            // if (!!(print_data.Изделия[j])){
            //     if ((print_data.Изделия[j-1].Номенклатура != print_data.Изделия[j].Номенклатура)){
            //         doc.put(template_products, template_products.attributes);
            //     }
            // }else{doc.put(template_products, template_products.attributes);}
        } //for (i in print_data.Продукция){

        //Округлим результаты
        total_products_obj.ИтогоПлощадь = total_products_obj.ИтогоПлощадь.round(2);
        total_products_obj.ИтогоЦена = total_products_obj.ИтогоЦена.round(2);
        total_products_obj.ИтогоСумма = total_products_obj.ИтогоСумма.round(2);
        total_products_obj.ИтогоЦенаБезСкидок = total_products_obj.ИтогоЦенаБезСкидок.round(2);
        total_products_obj.СредняяСкидка = ( (total_products_obj.ИтогоЦенаБезСкидок - total_products_obj.ИтогоСумма) * 100 / total_products_obj.ИтогоЦенаБезСкидок).round(0);

        // Соберем в Итоговую
        allTotals.СоСкидкой += total_products_obj.ИтогоСумма;
        allTotals.БезСкидки += total_products_obj.ИтогоЦенаБезСкидок;

        //Сделаем "Красиво"
        total_products_obj.ИтогоСумма = add_zero(total_products_obj.ИтогоСумма.toLocaleString('ru-RU'));
        total_products_obj.ИтогоЦена = add_zero(total_products_obj.ИтогоЦена.toLocaleString('ru-RU'));
        total_products_obj.ИтогоПлощадь = add_zero(total_products_obj.ИтогоПлощадь.toLocaleString('ru-RU'));
        total_products_obj.ИтогоЦенаБезСкидок = add_zero(total_products_obj.ИтогоЦенаБезСкидок.toLocaleString('ru-RU'));
        //Сформируем строку Итого

        let product_info_total = document.createElement("tr");
        product_info_total.style.borderColor = "white";
        product_info_total.style.borderStyle = "solid";
        product_info_total.style.width = "thin";
        product_info_total.style.borderTopColor = "black";
        product_info_total.style.borderBottomColor = "white";
        product_info_total.style.borderLeftColor = "white";
        product_info_total.style.borderRightColor = "white";
        product_info_total.style.borderBottomWidth = "thick";
        product_info_total.style.borderLeftWidth = "thick";
        product_info_total.style.borderRightWidth = "thick";
        product_info_total.style.borderTopWidth = "thin";

        product_info_total.innerHTML = pi_total_innerHTML;

        product_info_total.innerHTML = dhx4.template(product_info_total.innerHTML, total_products_obj);
        template_products.children[0].tBodies[0].append(product_info_total);

        ////Выведем таблицу со светопрозрачными конструкциями в документ
        //doc.put(template_products, template_products.attributes);

        //Выведем таблицу с Итогами по светопрозрачными конструкциями в документ
        //doc.put(template_total_products, template_total_products.attributes);
    }

    for (let i = 0; i < 2; i++) {
        var product_blank = document.createElement("tr");
        product_blank.innerHTML = pi_blank_innerHTML;
        product_blank.style.borderStyle = "solid";
        product_blank.style.borderLeftColor = "white";
        product_blank.style.borderRightColor = "white";
        product_blank.style.borderBottomColor = "white";
        product_blank.style.borderLeftWidth = "thick";
        product_blank.style.borderRightWidth = "thick";
        product_blank.style.borderBottomWidth = "thick";
        template_products.children[0].tBodies[0].append(product_blank);
    }
    var product_blank = document.createElement("tr");
    product_blank.innerHTML = pi_blank_innerHTML;
    product_blank.style.borderStyle = "solid";
    product_blank.style.borderLeftColor = "white";
    product_blank.style.borderRightColor = "white";
    product_blank.style.borderBottomColor = "grey";
    product_blank.style.borderLeftWidth = "thick";
    product_blank.style.borderRightWidth = "thick";
    product_blank.style.borderBottomWidth = "thin";
    template_products.children[0].tBodies[0].append(product_blank);


    if (print_data.ДопПродукция.length) {
        //Сортируем в алфавитном порядке
        print_data.ДопПродукция = print_data.ДопПродукция.sort(function(obj1, obj2) {
            let compA = obj1.Номенклатура.toUpperCase();
            let compB = obj2.Номенклатура.toUpperCase();
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });

        //Начинаем фомировать таблицы
        //Создаем div в который "завернем" таблицу
        //let template_products = document.createElement("div");
        //template_products.innerHTML += templates.dop_products.innerHTML;

        // создаем html шаблон с описанием продукта.
        let product_head = document.createElement("tr");

        product_head.innerHTML = head_dop_pi_innerHTML;
        //product_head.style.borderColor = "white";
        //product_head.style.borderStyle = "solid";
        //product_head.style.borderTopColor = "black";
        //product_head.style.borderTopWidth = "thin";

        //product_head.innerHTML = dhx4.template(product_head.innerHTML, product_head.attributes);
        template_products.children[0].tBodies[0].append(product_head);

        //Создаем объект с Итоговыми значениями
        let total_products_obj = {};
        total_products_obj.ИтогоКоличество = 0;
        total_products_obj.ИтогоПлощадь = 0;
        total_products_obj.ИтогоЦена = 0;
        total_products_obj.ИтогоСумма = 0;
        total_products_obj.ВсегоПозиций = 0;
        total_products_obj.СредняяСкидка = 0;
        total_products_obj.ИтогоЦенаБезСкидок = 0;


        for (let i = 0; i < print_data.ДопПродукция.length; i++) {
            // if ((i==0)||(print_data.ДопПродукция[i].Номенклатура != print_data.ДопПродукция[i-1].Номенклатура)){
            //     template_products = document.createElement("div");
            //     template_products.innerHTML += templates.products.innerHTML;
            //     template_products.innerHTML = dhx4.template(template_products.innerHTML, print_data.ДопПродукция[i]);
            // }
            //получаем информацию о продукте.
            let prod_data = print_data.ДопПродукция[i];
            prod_data.ЦенаСоСкидкой = print_data.Скидка;

            prod_data.Описание = prod_data.Номенклатура + " " + prod_data.Цвет + " " + prod_data.Размеры;
            prod_data.Габариты = prod_data.Длинна + " x " + prod_data.Ширина.round(2);
            prod_data.Площадь = prod_data.Площадь.round(2);
            prod_data.ОбщаяПлощадь = prod_data.Количество * prod_data.Площадь;
            prod_data.ОбщаяПлощадь = prod_data.ОбщаяПлощадь.round(2);
            prod_data.ЦенаБезСкидки = (prod_data.Цена * prod_data.Количество).round(2);

            //Накопим результат
            total_products_obj.ИтогоКоличество += prod_data.Количество;
            total_products_obj.ИтогоПлощадь += prod_data.ОбщаяПлощадь;
            total_products_obj.ИтогоЦена += prod_data.Цена;
            total_products_obj.ИтогоСумма += prod_data.Сумма.round(0);
            total_products_obj.ВсегоПозиций = print_data.Изделия.length;
            total_products_obj.ИтогоЦенаБезСкидок += prod_data.Цена.round(0) * prod_data.Количество;

            prod_data.Цена = add_zero(prod_data.Цена.toLocaleString('ru-RU'));
            prod_data.Площадь = add_zero(prod_data.Площадь.round(2).toLocaleString('ru-RU'));
            prod_data.ОбщаяПлощадь = add_zero(prod_data.ОбщаяПлощадь.toLocaleString('ru-RU'));
            prod_data.Сумма = add_zero(prod_data.Сумма.round(0).toLocaleString('ru-RU'));
            prod_data.ЦенаБезСкидки = add_zero(prod_data.ЦенаБезСкидки.toLocaleString('ru-RU'));

            // создаем html шаблон с описанием продукта.
            let product_info = document.createElement("tr");

            product_info.innerHTML = pi_innerHTML;

            product_info.innerHTML = dhx4.template(product_info.innerHTML, prod_data);
            template_products.children[0].tBodies[0].append(product_info);
            // let j = i + 1;
            // if (!!(print_data.ДопПродукция[j])){
            //     if ((print_data.ДопПродукция[j-1].Номенклатура != print_data.ДопПродукция[j].Номенклатура)){
            //         doc.put(template_products, template_products.attributes);
            //     }
            // }else{doc.put(template_products, template_products.attributes);}
        } //for (i in print_data.Продукция){

        ////Выведем таблицу со ДопПродукцией в документ
        //doc.put(template_products, template_products.attributes);

        //Округлим результаты
        total_products_obj.ИтогоПлощадь = total_products_obj.ИтогоПлощадь.round(2);
        total_products_obj.ИтогоЦена = total_products_obj.ИтогоЦена.round(2);
        total_products_obj.ИтогоСумма = total_products_obj.ИтогоСумма.round(2);
        total_products_obj.ИтогоЦенаБезСкидок = total_products_obj.ИтогоЦенаБезСкидок.round(2);
        total_products_obj.СредняяСкидка = ( (total_products_obj.ИтогоЦенаБезСкидок - total_products_obj.ИтогоСумма) * 100 / total_products_obj.ИтогоЦенаБезСкидок).round(0);

        // Соберем в Итоговую
        allTotals.СоСкидкой += total_products_obj.ИтогоСумма;
        allTotals.БезСкидки += total_products_obj.ИтогоЦенаБезСкидок;

        //Сделаем "Красиво"
        total_products_obj.ИтогоСумма = add_zero(total_products_obj.ИтогоСумма.toLocaleString('ru-RU'));
        total_products_obj.ИтогоЦена = add_zero(total_products_obj.ИтогоЦена.toLocaleString('ru-RU'));
        total_products_obj.ИтогоПлощадь = add_zero(total_products_obj.ИтогоПлощадь.toLocaleString('ru-RU'));
        total_products_obj.ИтогоЦенаБезСкидок = add_zero(total_products_obj.ИтогоЦенаБезСкидок.toLocaleString('ru-RU'));

        let product_dop_info_total = document.createElement("tr");
        product_dop_info_total.innerHTML = pi_dop_total_innerHTML;
        product_dop_info_total.style.borderColor = "white";
        product_dop_info_total.style.borderStyle = "solid";
        product_dop_info_total.style.width = "thin";
        product_dop_info_total.style.borderTopColor = "black";
        product_dop_info_total.style.borderBottomColor = "white";
        product_dop_info_total.style.borderLeftColor = "white";
        product_dop_info_total.style.borderRightColor = "white";
        product_dop_info_total.style.borderBottomWidth = "thick";
        product_dop_info_total.style.borderLeftWidth = "thick";
        product_dop_info_total.style.borderRightWidth = "thick";
        product_dop_info_total.style.borderTopWidth = "thin";

        product_dop_info_total.innerHTML = dhx4.template(product_dop_info_total.innerHTML, total_products_obj);
        template_products.children[0].tBodies[0].append(product_dop_info_total);
    }

    for (let i = 0; i < 2; i++) {
        product_blank = document.createElement("tr");
        product_blank.innerHTML = pi_blank_innerHTML;
        product_blank.style.borderStyle = "solid";
        product_blank.style.borderLeftColor = "white";
        product_blank.style.borderRightColor = "white";
        product_blank.style.borderBottomColor = "white";
        product_blank.style.borderLeftWidth = "thick";
        product_blank.style.borderRightWidth = "thick";
        product_blank.style.borderBottomWidth = "thick";
        template_products.children[0].tBodies[0].append(product_blank);
    }
    product_blank = document.createElement("tr");
    product_blank.innerHTML = pi_blank_innerHTML;
    product_blank.style.borderStyle = "solid";
    product_blank.style.borderLeftColor = "white";
    product_blank.style.borderRightColor = "white";
    product_blank.style.borderBottomColor = "grey";
    product_blank.style.borderLeftWidth = "thick";
    product_blank.style.borderRightWidth = "thick";
    product_blank.style.borderBottomWidth = "thin";
    template_products.children[0].tBodies[0].append(product_blank);

    if (print_data.Услуги.length) {
        //Сортируем в алфавитном порядке
        print_data.Услуги = print_data.Услуги.sort(function(obj1, obj2) {
            let compA = obj1.Номенклатура.toUpperCase();
            let compB = obj2.Номенклатура.toUpperCase();
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        });

        //Начинаем фомировать таблицы
        //Создаем div в который "завернем" таблицу
        //let template_products = document.createElement("div");
        //template_products.innerHTML += templates.dop_products.innerHTML;

        // создаем html шаблон с описанием продукта.
        let product_head = document.createElement("tr");

        product_head.innerHTML = head_serv_pi_innerHTML;
        //product_head.style.borderColor = "white";
        //product_head.style.borderStyle = "solid";
        //product_head.style.borderTopColor = "black";
        //product_head.style.borderTopWidth = "thin";

        //product_head.innerHTML = dhx4.template(product_head.innerHTML, product_head.attributes);
        template_products.children[0].tBodies[0].append(product_head);

        //Создаем объект с Итоговыми значениями
        let total_products_obj = {};
        total_products_obj.ИтогоКоличество = 0;
        total_products_obj.ИтогоПлощадь = 0;
        total_products_obj.ИтогоЦена = 0;
        total_products_obj.ИтогоСумма = 0;
        total_products_obj.ВсегоПозиций = 0;
        total_products_obj.СредняяСкидка = 0;
        total_products_obj.ИтогоЦенаБезСкидок = 0;


        for (let i = 0; i < print_data.Услуги.length; i++) {
            // if ((i==0)||(print_data.Услуги[i].Номенклатура != print_data.Услуги[i-1].Номенклатура)){
            //     template_products = document.createElement("div");
            //     template_products.innerHTML += templates.products.innerHTML;
            //     template_products.innerHTML = dhx4.template(template_products.innerHTML, print_data.Услуги[i]);
            // }
            //получаем информацию о продукте.
            let prod_data = print_data.Услуги[i];
            prod_data.ЦенаСоСкидкой = print_data.Скидка;

            prod_data.Описание = prod_data.Номенклатура + " " + prod_data.Цвет + " " + prod_data.Размеры;
            prod_data.Габариты = prod_data.Длинна + " x " + prod_data.Ширина.round(2);
            prod_data.Площадь = prod_data.Площадь.round(2);
            prod_data.ОбщаяПлощадь = prod_data.Количество * prod_data.Площадь;
            prod_data.ОбщаяПлощадь = prod_data.ОбщаяПлощадь.round(2);
            prod_data.ЦенаБезСкидки = (prod_data.Цена * prod_data.Количество).round(2);

            //Накопим результат
            total_products_obj.ИтогоКоличество += prod_data.Количество;
            total_products_obj.ИтогоПлощадь += prod_data.ОбщаяПлощадь;
            total_products_obj.ИтогоЦена += prod_data.Цена;
            total_products_obj.ИтогоСумма += prod_data.Сумма.round(0);
            total_products_obj.ВсегоПозиций = print_data.Изделия.length;
            total_products_obj.ИтогоЦенаБезСкидок += prod_data.Цена.round(0) * prod_data.Количество;

            prod_data.Цена = add_zero(prod_data.Цена.toLocaleString('ru-RU'));
            prod_data.Площадь = add_zero(prod_data.Площадь.round(2).toLocaleString('ru-RU'));
            prod_data.ОбщаяПлощадь = add_zero(prod_data.ОбщаяПлощадь.toLocaleString('ru-RU'));
            prod_data.Сумма = add_zero(prod_data.Сумма.round(0).toLocaleString('ru-RU'));
            prod_data.ЦенаБезСкидки = add_zero(prod_data.ЦенаБезСкидки.toLocaleString('ru-RU'));

            // создаем html шаблон с описанием продукта.
            let product_info = document.createElement("tr");

            product_info.innerHTML = pi_innerHTML;

            product_info.innerHTML = dhx4.template(product_info.innerHTML, prod_data);
            template_products.children[0].tBodies[0].append(product_info);
            // let j = i + 1;
            // if (!!(print_data.Услуги[j])){
            //     if ((print_data.Услуги[j-1].Номенклатура != print_data.Услуги[j].Номенклатура)){
            //         doc.put(template_products, template_products.attributes);
            //     }
            // }else{doc.put(template_products, template_products.attributes);}
        } //for (i in print_data.Продукция){

        ////Выведем таблицу со ДопПродукцией в документ
        //doc.put(template_products, template_products.attributes);

        //Округлим результаты
        total_products_obj.ИтогоПлощадь = total_products_obj.ИтогоПлощадь.round(2);
        total_products_obj.ИтогоЦена = total_products_obj.ИтогоЦена.round(2);
        total_products_obj.ИтогоСумма = total_products_obj.ИтогоСумма.round(2);
        total_products_obj.ИтогоЦенаБезСкидок = total_products_obj.ИтогоЦенаБезСкидок.round(2);
        total_products_obj.СредняяСкидка = ( (total_products_obj.ИтогоЦенаБезСкидок - total_products_obj.ИтогоСумма) * 100 / total_products_obj.ИтогоЦенаБезСкидок).round(0);

        // Соберем в Итоговую
        allTotals.СоСкидкой += total_products_obj.ИтогоСумма;
        allTotals.БезСкидки += total_products_obj.ИтогоЦенаБезСкидок;
        allTotals.СредняяСкидка = ( (allTotals.БезСкидки - allTotals.СоСкидкой) * 100 / allTotals.БезСкидки).round(0);

        //Сделаем "Красиво"
        total_products_obj.ИтогоСумма = add_zero(total_products_obj.ИтогоСумма.toLocaleString('ru-RU'));
        total_products_obj.ИтогоЦена = add_zero(total_products_obj.ИтогоЦена.toLocaleString('ru-RU'));
        total_products_obj.ИтогоПлощадь = add_zero(total_products_obj.ИтогоПлощадь.toLocaleString('ru-RU'));
        total_products_obj.ИтогоЦенаБезСкидок = add_zero(total_products_obj.ИтогоЦенаБезСкидок.toLocaleString('ru-RU'));

        let product_serv_info_total = document.createElement("tr");
        product_serv_info_total.innerHTML = pi_dop_total_innerHTML;
        product_serv_info_total.style.borderColor = "white";
        product_serv_info_total.style.borderStyle = "solid";
        product_serv_info_total.style.width = "thin";
        product_serv_info_total.style.borderTopColor = "black";
        product_serv_info_total.style.borderBottomColor = "white";
        product_serv_info_total.style.borderLeftColor = "white";
        product_serv_info_total.style.borderRightColor = "white";
        product_serv_info_total.style.borderBottomWidth = "thick";
        product_serv_info_total.style.borderLeftWidth = "thick";
        product_serv_info_total.style.borderRightWidth = "thick";
        product_serv_info_total.style.borderTopWidth = "thin";

        product_serv_info_total.innerHTML = dhx4.template(product_serv_info_total.innerHTML, total_products_obj);
        template_products.children[0].tBodies[0].append(product_serv_info_total);
    }
    allTotals.СоСкидкой = add_zero(allTotals.СоСкидкой.toLocaleString('ru-RU'));
    allTotals.БезСкидки =add_zero(allTotals.БезСкидки.toLocaleString('ru-RU'));

    let allTr = document.createElement('tr');
    allTr.innerHTML = `<td colspan="8" align="left"   bgcolor="white" >Итоговая документа:</td>
                        <td colspan="3" align="right" bgcolor="white" >#БезСкидки#</td>
                        <td colspan="2" align="right" bgcolor="white" >#СредняяСкидка#</td>
                        <td colspan="2" align="right" bgcolor="white" >#СоСкидкой#</td>`;
    allTr.innerHTML = dhx4.template(allTr.innerHTML, allTotals);
    template_products.children[0].tBodies[0].append(allTr);

    //Выведем таблицу со светопрозрачными конструкциями в документ
    if ((print_data.Изделия.length) || (print_data.ДопПродукция.length) || (print_data.Услуги.length)) {
        doc.put(template_products, template_products.attributes);
    }

    //Выводим нижний колонтитул
    doc.put(templates.footer, templates.footer.attributes);

    return doc;

});
