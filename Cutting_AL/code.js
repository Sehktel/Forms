//Для отладки
//console.log("2.1 Резка в ЦЕХ Координатная");

d = $p.doc.calc_order.get(obj);
    tt_prod = [];
	tt_furn = [];

d.production.each(r=>{

	var c = $p.cat.characteristics.get(r.characteristic);
	//console.log(c.presentation);
 	koef = 1000;
	//debugger;
if(c.coordinates._obj.length){
		var co = c.coordinates._obj;
		ff = 0;		f_rw = {};		glass_rw = {};		arm_rw = {};		prof_rw = {};		full_rw = [];
		prod = {};  f_glass = [];  arm = []; prof = []; k = 10;
		shtapik = []; podstav = [];
		co.forEach(row => {
			flag_arm = false; flag_prof = false;
			//debugger;
			c.specification.each(s =>{
				if (s.elm == row.elm){
					n = $p.cat.nom.get(s.nom);
					if (n.grouping == "Армирование"){
						arm_rw = {
							grp : "Армирование",
							elm	: s.elm,
							nfn	: n.name_full,
							len : Math.round(s.len * koef, -2),
							art : n.article
						};
						flag_arm = true;
						arm.push(arm_rw);
                    }
					if (n.grouping == "Профиль"){
						prof_rw = {
							grp     : "Профиль",
							elm	    : s.elm,
							etype   : row.elm_type,
							need_arm: false,
							orient  : row.orientation.substr(0, 3),
							pos	    : row.pos.substr(0, 3),
							or_pos  : row.orientation.substr(0, 3) + " " + row.pos.substr(0, 3),
                            nfn	    : n.name_full,
							len     : Math.round((s.len * koef)*k)/k,
							art     : n.article,
							ang     : s.alp1 + " x " + s.alp2,
							anglen  : s.alp1 + " x " + s.alp2 + " " + Math.round((s.len * koef)*k)/k,

						};
                        if ((row.elm_type == $p.enm.elm_types.Рама)||(row.elm_type == $p.enm.elm_types.Створка)||(row.elm_type == $p.enm.elm_types.Импост)){
							prof_rw.need_arm = true;
							flag_prof = true;
							prof.push(prof_rw);
						}
						if ((n.elm_type == $p.enm.elm_types.Штапик)||(n.elm_type == $p.enm.elm_types.Подставочник)){
							if (n.elm_type == $p.enm.elm_types.Штапик){
								shtapik.push(prof_rw);
							}
							if (n.elm_type == $p.enm.elm_types.Подставочник){
								podstav.push(prof_rw);
							}
						};
                    }
				}
			});

			if (row.elm_type == $p.enm.elm_types.Стекло){
				let i = $p.cat.inserts.get(row.inset);
				let w = Math.abs(row.x2 - row.x1) / koef;
				let h = Math.abs(row.y2 - row.y1) / koef;

				glass_rw = {
					elm     : row.elm,
					article : d.number_doc + "/" + row.elm,
					height  : Math.round((h * koef)*k)/k,
					width   : Math.round((w * koef)*k)/k,
					dim		: Math.round((w * koef)*k)/k + " x " + Math.round((h * koef)*k)/k,
					aray    : (w*h).round(3),
					present : i.presentation
				};
				f_glass.push(glass_rw);
				//console.log(row);
			}
		});
		//prod.rw = full_rw;
		prod.arm   = arm;
		prod.prof  = prof;
		prod.glass = f_glass;
		prod.sh = shtapik;
        prod.pods = podstav;
        //prod.fk = ff_furn_komplekt;
        prod.pods = podstav;
        prod.ref = c.ref;
//		console.log(prod);
		tt_prod.push(prod);
	}

	if(c.specification._obj.length){
		debugger;
		//var cs = c.specification.group_by("nom", "qty");
		var cs = c.specification.aggregate("nom","qty", "sum", true);
        ff_furn_komplekt = [];
        furn = {};
		cs.forEach(row => {
			n = $p.cat.nom.get(row.nom);
			if (n._grouping == "Фурнитура"){
				furn_rw = {
					furn : true,
					elm  : row.elm,
                	id   : d.number_doc + "/" + row.elm,
					art  : n.article,
                    nfn  : n.name_full,
                    qty	 : row.qty
				}
				ff_furn_komplekt.push(furn_rw);
			};
			if (n._grouping == "Комплектация"){
				furn_rw = {
					furn : false,
                     	elm  : row.elm,
                        id   : d.number_doc + "/" + row.elm,
                        art  : n.article,
                        nfn  : n.name_full,
                        qty	 : row.qty
                    }
				ff_furn_komplekt.push(furn_rw);
			};
		});
        furn.fk = ff_furn_komplekt;
        furn.ref = c.ref;
        tt_furn.push(furn);
    }
})

//tt_prod   -- Содержит все необходимые мне данные, практически в готовом виде.

var templates = this._template.content.children,
        doc = new $p.SpreadsheetDocument(),
        print_data,
        global_price;
        global_price = 0;


function draw_row_name(row_product, table_div, picture, prod_info, furn_info){
        var hide_table = false;
        //debugger;
        var table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();
//
//        table_body.innerHTML =`

        //table_row = document.createElement("tr");
        var table_line = {
                Эскиз: picture,
                Номенклатура: row_product.nom.name,
                Характеристика : row_product.characteristic.name,
                Комментарий : row_product._obj.note,
                Размеры   : "  " + row_product.len + " x " + row_product.width + "   мм. x " + row_product.qty.round(2) + "  шт."
            };


        table_body.tBodies[0].innerHTML = `
                <tr>
                  <td colspan = '80' style="width:100%" align='center' >#Эскиз#</td>
                </tr>
                <tr>
                  <td colspan = '16' style="width:20%"> Номенклатура </td>
                  <td colspan = '64' style="width:80%">#Номенклатура#</td>
                </tr>
                <tr>
                  <td colspan = '16' style="width:20%"> Характеристика </td>
                  <td colspan = '64' style="width:80%">#Характеристика#</td>
                </tr>
                <tr>
                  <td colspan = '16' style="width:20%"> Размеры </td>
                  <td colspan = '64' style="width:80%">#Размеры#</td>
                </tr>
                <tr>
                  <td colspan = '16' style="width:20%"> Комментарий </td>
                  <td colspan = '64' style="width:80%">#Комментарий#</td>
                </tr>`;
        table_body.tBodies[0].innerHTML = dhx4.template(table_body.tBodies[0].innerHTML, table_line);
        table_div.appendChild(table_body);



        table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();

        //Начинаем проверять, есть ли в изделии створки, если есть, то выводим их в таблицу.
            table_row = document.createElement("tr");
                table_row.innerHTML = `
                <td colspan = '04' style=" border-color:black; border-width : 1px; border-style: solid" >№Ств.</td>

                <td colspan = '36' style=" border-color:black; border-width : 1px; border-style: solid" >Наименование</td>
                <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Высота руч.</td>
                <td colspan = '08' style=" border-color:black; border-width : 1px; border-style: solid" >Напр.открывания</td>
                <td colspan = '22' style=" border-color:black; border-width : 1px; border-style: solid" >Размер по фальцу</td>
                `;
                table_body.tBodies[0].appendChild(table_row);

        row_product.characteristic.constructions.forEach((ff)=>{
            if (ff.furn != $p.utils.blank.guid){
                table_row = document.createElement("tr");
                table_row.innerHTML = `
                <td colspan = '04'  style=" border-color:black; border-width : 1px; border-style: solid" >#constrn#</td>
                <td colspan = '36'  style=" border-color:black; border-width : 1px; border-style: solid" >#name#</td>
                <td colspan = '10'  style=" border-color:black; border-width : 1px; border-style: solid" >#handle_h#</td>
                <td colspan = '08'  style=" border-color:black; border-width : 1px; border-style: solid" >#direct#</td>
                <td colspan = '22'  style=" border-color:black; border-width : 1px; border-style: solid" >#falce#</td>
                `
                table_line = {
                    constrn     : ff.cnstr-1,
                    name        : ff.furn.name,
                    handle_h    : ff.h_ruch,
                    direct      : ff.direction,
                    falce       : Math.round(ff.w) + " x "+ Math.round(ff.h) + " мм.",
                }
                table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
                table_body.tBodies[0].appendChild(table_row);
            }
        })
        table_div.appendChild(table_body);


        table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();
            //Начинаем заполнять таблицу профилей
            table_row = document.createElement("tr");
                table_row.innerHTML = `
                <td colspan = '80'><b>Профили</b></td>
                `;
                table_body.tBodies[0].appendChild(table_row);
            table_row = document.createElement("tr");
                table_row.innerHTML = `
                 <!--   <td colspan = '04' style=" border-color:black; border-width : 1px; border-style: solid" >Тип</td> -->
                    <td colspan = '40' style=" border-color:black; border-width : 1px; border-style: solid" >Название</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Артикул</td>
                 <!--   <td colspan = '05' style=" border-color:black; border-width : 1px; border-style: solid" >Ориент.</td> -->

                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Углы</td>
                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Длинна</td>
                <!--    <td colspan = '06' style=" border-color:black; border-width : 1px; border-style: solid" >Арм-ка</td> -->
                <!--    <td colspan = '14' style=" border-color:black; border-width : 1px; border-style: solid" >Арт. Арм.</td>  -->
                `;
//                    <td colspan = '06' style=" border-color:black; border-width : 1px; border-style: solid" >Поз.</td>

                table_body.tBodies[0].appendChild(table_row);
            prod_info.prof.forEach((profile)=>{
                table_row = document.createElement("tr");
                if (profile.need_arm){ //Армировка нужна
                    table_row.innerHTML = `
               <!--      <td colspan = '04' style=" border-color:black; border-width : 1px; border-style: solid" >#etype#</td> -->
                    <td colspan = '40' style=" border-color:black; border-width : 1px; border-style: solid" >#nfn#</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#art#</td>
               <!--     <td colspan = '05' align="justify" style=" border-color:black; border-width : 1px; border-style: solid">#or_pos#</td>  -->

                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#ang#</td>
                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" ><b>#len#</b></td>
                <!--    <td colspan = '06' style=" border-color:black; border-width : 1px; border-style: solid" >#arm_len#</td>  -->
                <!--    <td colspan = '14' style=" border-color:black; border-width : 1px; border-style: solid" >#arm_art#</td>  -->
                    `
                    //<td colspan = '06' style=" border-color:black; border-width : 1px; border-style: solid" >#pos#</td>
                    	if (profile.arm) {
                     	arm_rw = profile.arm;
                        table_line = {
							grp     : profile.grp,
							elm	    : profile.elm,
							etype   : profile.etype,
							need_arm: profile.need_arm,
							orient  : profile.orient,
                            or_pos  : profile.or_pos,
							pos	    : profile.pos,
							nfn	    : profile.nfn,
							len     : profile.len,
							art     : profile.art,
							ang     : profile.ang,
							anglen  : profile.anglen,
							arm_grp : arm_rw.grp,
							arm_elm	: arm_rw.elm,
							arm_nfn	: arm_rw.nfn,
							arm_len : arm_rw.len,
							arm_art : arm_rw.art
						};
                        }else{
                            table_line = profile;
                        }

                }else{ //Армировка не нужна
                    table_row.innerHTML = `
                    <td colspan = '40' style=" border-color:black; border-width : 1px; border-style: solid" >#nfn#</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#art#</td>
                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#ang#</td>
                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" ><b>#len#</b></td>
                    `
                    table_line = profile;
                }
                table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
                table_body.tBodies[0].appendChild(table_row);
            });
            table_div.appendChild(table_body);




        table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();
           //приступаем к табличной части Штапиков
              table_row = document.createElement("tr");
                table_row.innerHTML = `
                <td colspan = '80'><b>Штапики</b></td>
                `;
                table_body.tBodies[0].appendChild(table_row);
            table_row = document.createElement("tr");
            table_row.innerHTML = `
                    <td colspan = '60' style=" border-color:black; border-width : 1px; border-style: solid" >Название</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Артикул</td>
                  <!--  <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Ориент.</td> -->
                  <!--  <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Поз.</td> -->
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Длинна</td>
                `;
//                    <td colspan = 30 style="width:37.5%; border-color:black; border-width : 1px; border-style: solid" ></td>
                table_body.tBodies[0].appendChild(table_row);
            prod_info.sh.forEach((shtapik)=>{
                table_row = document.createElement("tr");
                table_row.innerHTML = `
                    <td colspan = '60' style=" border-color:black; border-width : 1px; border-style: solid" >#nfn#</td>
                    <td colspan = '02' style=" border-color:black; border-width : 1px; border-style: solid" >#art#</td>
                <!--    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#orient#</td>  -->
                <!--    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#pos#</td> -->
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#len#</td>
                `;
//                    <td colspan = 30 style="width:37.5%; border-color:black; border-width : 1px; border-style: solid" ></td>

                    table_line = shtapik;

                table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
                table_body.tBodies[0].appendChild(table_row);
            });
            table_div.appendChild(table_body);



        table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();
           //приступаем к табличной части Подставочники
              table_row = document.createElement("tr");
                table_row.innerHTML = `
                <td colspan = '80'><b>Подставочные профили</b></td>
                `;
                table_body.tBodies[0].appendChild(table_row);
            table_row = document.createElement("tr");
            table_row.innerHTML = `
                    <td colspan = '60' style=" border-color:black; border-width : 1px; border-style: solid" >Название</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Артикул</td>
                <!--    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Ориент.</td> -->
                <!--    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Поз.</td>  -->
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Длинна</td>
                `;
//                    <td colspan = 30 style="width:37.5%; border-color:black; border-width : 1px; border-style: solid" ></td>
                table_body.tBodies[0].appendChild(table_row);
            prod_info.pods.forEach((podstav)=>{
                table_row = document.createElement("tr");
                table_row.innerHTML = `
                    <td colspan = '60' style=" border-color:black; border-width : 1px; border-style: solid" >#nfn#</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#art#</td>
                <!--    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#orient#</td> -->
                <!--    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#pos#</td>  -->
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#len#</td>
                `;
//                    <td colspan = 30 style="width:37.5%; border-color:black; border-width : 1px; border-style: solid" ></td>
                    //debugger;
                    table_line = podstav;

                table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
                table_body.tBodies[0].appendChild(table_row);
            });
            table_div.appendChild(table_body);


        table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();
           //приступаем к табличной части Подставочники
              table_row = document.createElement("tr");
                table_row.innerHTML = `
                <td colspan = '80'><b>Фурнитура и Комплектация</b></td>
                `;
                table_body.tBodies[0].appendChild(table_row);
            table_row = document.createElement("tr");
            table_row.innerHTML = `
                    <td colspan = '05' style=" border-color:black; border-width : 1px; border-style: solid" >Счет/Изделие</td>
                    <td colspan = '15' style=" border-color:black; border-width : 1px; border-style: solid" >Артикул</td>
                    <td colspan = '50' style=" border-color:black; border-width : 1px; border-style: solid" >Ориент.</td>
                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >Поз.</td>
                `;
//                    <td colspan = 30 style="width:37.5%; border-color:black; border-width : 1px; border-style: solid" ></td>
                table_body.tBodies[0].appendChild(table_row);
            furn_info.fk.forEach((furn_k)=>{
                table_row = document.createElement("tr");
                table_row.innerHTML = `
                    <td colspan = '05' style=" border-color:black; border-width : 1px; border-style: solid" >#id#</td>
                    <td colspan = '15' style=" border-color:black; border-width : 1px; border-style: solid" >#art#</td>
                    <td colspan = '50' style=" border-color:black; border-width : 1px; border-style: solid" >#nfn#</td>
                    <td colspan = '10' style=" border-color:black; border-width : 1px; border-style: solid" >#qty#</td>
                `;
//                    <td colspan = 30 style="width:37.5%; border-color:black; border-width : 1px; border-style: solid" ></td>
                    //debugger;
                    table_line = furn_k;

                table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
                table_body.tBodies[0].appendChild(table_row);
            });
            table_div.appendChild(table_body);



        table_body = document.createElement("table");
        table_body.style.borderCollapse = "collapse";
        table_body.style.width = "100%";
        table_body.createTBody();
            //приступаем к табличной части Стекол
            table_row = document.createElement("tr");
            table_row.innerHTML = `
                <td  colspan = '80'><b>Заполнение</b></td>
                `;
                table_body.tBodies[0].appendChild(table_row);
            table_row = document.createElement("tr");
            table_row.innerHTML = `
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Артикул</td>
                    <td colspan = '12' style=" border-color:black; border-width : 1px; border-style: solid" >Элем.№</td>
                    <td colspan = '28' style=" border-color:black; border-width : 1px; border-style: solid" >Формула</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >Размеры</td>
                `;
                table_body.tBodies[0].appendChild(table_row);
            prod_info.glass.forEach((gl)=>{
                table_row = document.createElement("tr");
                table_row.innerHTML = `
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#article#</td>
                    <td colspan = '12' style=" border-color:black; border-width : 1px; border-style: solid" >#elm#</td>
                    <td colspan = '28' style=" border-color:black; border-width : 1px; border-style: solid" >#present#</td>
                    <td colspan = '20' style=" border-color:black; border-width : 1px; border-style: solid" >#dim#</td>
                `;
                    table_line = gl;

                table_row.innerHTML = dhx4.template(table_row.innerHTML, table_line);
                table_body.tBodies[0].appendChild(table_row);
            });
            table_div.appendChild(table_body);

       // })




        return hide_table;
    }

//     }

//   Функции закончили, переходим к формированию документа.

    // // получаем данные печати
      return obj.print_data().then((res) => {
          print_data = res;
          doc.put(dhx4.template(templates.header.innerHTML, print_data), templates.header.attributes);
    //     // получаем объекты продукций
         var aobjs = [];
         obj.production.forEach(function (row) {
             if(!row.characteristic.empty())
                 aobjs.push($p.cat.characteristics.get(row.characteristic.ref, true, true));
         });

          return Promise.all(aobjs)
              .then(() => res)
      })
       .then((print_data) => {

         //Признак сокрытия таблицы
         var hide;

         console.log("2.1 Резка в ЦЕХ Координатная");

    //     //Выбираем из всей спецификации по всему заказу. Соотв на продукции делить смысла нет
         obj.production.forEach((row) => {


             var tpl_product = document.createElement('div');
             var product = document.createElement("div");
                 product.id='product';
                product.class = 'container';
                product.style.pageBreakAfter = 'always';
            var production_row_name = document.createElement("div");
                production_row_name.style.marginTop = "1cm";

            var space_row_name = document.createElement("div");
                space_row_name.id = "space_row_name";
                space_row_name.style.margin = 5;
                space_row_name.style.display = "block";
            var tabel_row_name = document.createElement("div");
                //tabel_row_name.style.display = "table";
                tabel_row_name.style.width = "100%";
                tabel_row_name.id = "table_row_name";

            tpl_product.appendChild(product);
            tpl_product.children.product.appendChild(space_row_name);
            tpl_product.children.product.appendChild(tabel_row_name);

            var tabel_div = document.createElement("div");
            tpl_product.children.product.appendChild(tabel_div);

            // выводим эскизы и описания продукций
            var tpl_picture = "";
            if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){
                if(print_data.ПродукцияЭскизы[row.characteristic.ref]){
                    tpl_picture =  $p.iface.scale_svg(print_data.ПродукцияЭскизы[row.characteristic.ref], {height: 320, width: 480, zoom: 0.3}, 0);
                }else{
                    tpl_picture = "";
                }
            }

            if(row.characteristic.coordinates._obj.length){
                //debugger;
                zz_prod = tt_prod.find((p)=>{if (p.ref == row.characteristic){return true;}});
                zz_furn = tt_furn.find((p)=>{if (p.ref == row.characteristic){return true;}});

                hide = draw_row_name(row, tabel_div, tpl_picture, zz_prod, zz_furn);
            }else{
                hide = true;
            }

            if (hide){
                tpl_product.children.product.children.table_row_name.innerHTML = "";
                tpl_product.children.product.children.table_row_name.innerHTML = "";
                } //if

            doc.put(tpl_product.innerHTML, tpl_product.attributes);

        }); //  obj.production.forEach((row) =>

         return doc;
      });
