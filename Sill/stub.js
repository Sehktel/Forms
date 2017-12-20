// на входе в переменной obj имеем:
// {
//	ox: ox,			-	объект характеристики текущей продукции
//	elm: elm,		-	текущий элемент, обычно - профиль
//	cnstr: 			-	текущий контур
//	inset:			- 	текущая вставка
//	row_ins: row_cnn_prev,	-	строка спецификации вставки, из которой произведён вызов формулы
//	row_spec: row_spec		-	строка спецификации изделия, в которой надо установить характеристику
//	}

//console.log("Корректировка кол-ва торцевых заглушек");
//debugger;

const {elm, row_ins, row_spec, inset, ox} = obj;

row_spec.qty = 0;

//Параметр "Ширина подоконника"
const ww_sill = this.params.get(0)._obj;

//Вперед установим кол-во торцевых заглушек в зависимости от Ширины подоконника (элемента).
if (!elm.height || !elm.width){
	if (elm.height){
		elm.width = elm.height;
	}else{
		elm.height = elm.width;
	}
}
//Получим ширину подоконника из параметра.
let sill_ww = parseInt($p.cat.property_values.get(ww_sill.value).name);

if (elm.width < sill_ww){
    row_spec.qty = 1;
} else {
	row_spec.qty = 2;
}

//Если попадется параметр "Ширина подоконника", то установим по нему.
ox.params.forEach((pr)=>{
	if (pr._obj.param == ww_sill.param){
		let pr_ww   =  parseInt($p.cat.property_values.get(pr._obj.value).name);
		let sill_ww =  parseInt($p.cat.property_values.get(ww_sill.value).name);
		if (pr_ww < sill_ww){
		    row_spec.qty = 1;
		} else {
			row_spec.qty = 2;
		}
	};
})

return row_spec.qty;
