// на входе в переменной obj имеем:
// {
//	ox,			-	объект характеристики текущей продукции
//	elm,		-	текущий элемент, обычно - профиль
//  cnstr,		-	номер конструкции или элемента для привязки параметров
//  inset,		-	вставка элемента или допвставка
//	row_ins,	-	строка спецификации вставки, из которой произведён вызов формулы
//	row_spec	-	строка спецификации изделия, в которой заполняем длину
//	}

//console.log("Размеры по парам._1") ;
//debugger;
const {ox, elm, cnstr, inset, row_ins, row_spec} = obj;
    auto_len = ox.y + 150;

// если продукция добавлена через _Добавить продукцию_
if(elm && typeof elm.len == 'number' && typeof elm.depth == 'number'){
	if (elm.len){
		row_spec.len = (elm.len + row_ins.sz) * (row_ins.coefficient || 0.001);
	}else{
		row_spec.len = 0;
	}
	if (elm.depth){
		row_spec.width = (elm.depth + row_ins.sz) * (row_ins.coefficient || 0.001);
	}else{
		row_spec.width = 0;
	}
	if ((row_spec.len)&&(row_spec.width)){
		return row_spec.qty = row_ins.quantity;
	}else{
		return 0;
	}
}

// получаем ссылку параметра, значение которого используем при поиске характеристики
const len = this.params.get(0).param;
const width = this.params.get(1).param;

// получим значение параметра в продукции
ox.params.find_rows({cnstr, inset, param: len}, (row_len) => {
	ox.params.find_rows({cnstr, inset, param: width}, (row_width) => {
		if (row_len.value > 0){
			row_spec.len = (row_len.value + row_ins.sz) * (row_ins.coefficient || 0.001);
		}else{
			row_spec.len = (row_len.value = auto_len) * (row_ins.coefficient || 0.001);
		}
		if (row_width.value > 0){
			row_spec.width = (row_width.value + row_ins.sz) * (row_ins.coefficient || 0.001);
		}else{
			row_spec.width = 0;
		}
		return false;
	});
	return false;
});

//return row_spec.qty = row_ins.quantity;
if ((row_spec.len)&&(row_spec.width)){
	return row_spec.qty = row_ins.quantity;
}else{
	return 0;
}
