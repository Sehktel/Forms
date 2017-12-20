// на входе в переменной obj имеем:
// {
//	ox,			-	объект характеристики текущей продукции
//	elm,		-	текущий элемент, обычно - профиль
//  cnstr,		-	номер конструкции или элемента для привязки параметров
//  inset,		-	вставка элемента или допвставка
//	row_ins,	-	строка спецификации вставки, из которой произведён вызов формулы
//	row_spec	-	строка спецификации изделия, в которой заполняем длину
//	}

//Размеры по парам._ПО ДЛИНЕ
debugger;

const {ox, elm, cnstr, inset, row_ins, row_spec} = obj,
	auto_len = ox.x + 250;

// если продукция добавлена через _Добавить продукцию_
if(elm && typeof elm.height == 'number' && typeof elm.depth == 'number'){
	row_spec.len = (elm.height + row_ins.sz) * (row_ins.coefficient || 0.001);
	return row_spec.qty = row_ins.quantity;
}

// получаем ссылку параметра, значение которого используем при поиске характеристики
const {param} = this.params.get(0);

// получим значение параметра в продукции
ox.params.find_rows({cnstr, inset, param}, (row_len) => {
	if (row_len.value > 0){
		row_spec.len = (row_len.value) * (row_ins.coefficient || 0.001);
	}else{
		row_spec.len = (row_len.value = auto_len) * (row_ins.coefficient || 0.001);
	}
});
// вытаскиваем из параметров вставки кол-во элементов и складываем в спецификацию
if (row_spec.len){
	return row_spec.qty = row_ins.quantity;
}else{
	return 0;
}
