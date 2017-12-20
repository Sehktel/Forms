// на входе в переменной obj имеем:
// {
//	ox: ox,			-	объект характеристики текущей продукции
//	elm: elm,		-	текущий элемент, обычно - профиль
//  cnstr: 0,		-	номер конструкции или элемента для привязки параметров
//  inset: inset,	-	вставка элемента или допвставка
//	row_ins: row_ins,	-	строка спецификации вставки, из которой произведён вызов формулы
//	row_spec: row_spec	-	строка спецификации изделия, в которой заполняем длину
//	}

const {ox, elm, cnstr, inset, row_ins, row_spec} = obj;
	auto_len = ox.y + 150;

//console.log ("Длина по размер бок");
//debugger;

// если продукция добавлена через _Добавить продукцию_
if(elm && typeof elm.len == 'number' && typeof elm.depth == 'number'){
	if (elm.len > 0){
		row_spec.len = (elm.len + row_ins.sz) * (row_ins.coefficient || 0.001);
		return row_spec.qty = row_ins.quantity;
	}
}

// получаем ссылку параметра, значение которого используем при поиске характеристики
const {param} = this.params.get(0);

// получим значение параметра в продукции
ox.params.find_rows({cnstr, inset, param}, function(row){
	if (row.value > 0){
		row_spec.len = (row.value + row_ins.sz) * (row_ins.coefficient || 0.001);
		return false;
	}else{
		row_spec.len = (row.value = auto_len) * (row_ins.coefficient || 0.001);
		return false;
	}
});
//Вытаскиваем из параметров вставки кол-во элементов и складываем в спецификацию
if (row_spec.len){
	return row_spec.qty = row_ins.quantity;
}else{
	return 0;
}
