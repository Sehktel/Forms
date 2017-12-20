// на входе в переменной obj имеем:
// {
//	ox,			-	объект характеристики текущей продукции
//	elm,		-	текущий элемент, обычно - профиль
//  cnstr,		-	номер конструкции или элемента для привязки параметров
//  inset,		-	вставка элемента или допвставка
//	row_ins,	-	строка спецификации вставки, из которой произведён вызов формулы
//	row_spec	-	строка спецификации изделия, в которой заполняем длину
//	}

console.log("Обработки осн. профилей (c припуском)");
debugger;

// разыменовываем параметры
let {
    elm,
    row_ins,
    row_spec,
    inset,
    ox
} = obj;
const {
    step,
    lmin,
    sz,
    offsets,
    quantity
} = row_ins;
//lmin - 90 - минимальное расстояние, при котором будет выполнено крепление.
//sz - отступ для импоста

const gen = elm.generatrix;
//припуск на сварку
// const dx0 = (elm._row.len - elm._attr._len) / 2;
const dx0 = 3;
const ox0 = gen.getOffsetOf(gen.getNearestPoint(elm.corns(1)));

// здесь накопим результат
var res = [];
var mres = [];

// получаем примыкающие импосты
//const imposts = elm.joined_imposts();
//const ipoints = [];
//imposts.inner.concat(imposts.outer).forEach(({point}) => {
//  const l = elm.generatrix.getOffsetOf(point);
//  if(ipoints.indexOf(l) == -1){
//    ipoints.push(l);
//  }
//});

// получаем примыкающие импосты
const imposts = elm.joined_imposts();
const ipoints = [];
imposts.inner.concat(imposts.outer).forEach(({
    profile,
    point
}) => {
    const l = elm.generatrix.getOffsetOf(point);
    if (profile.nom.name_full.toLowerCase().indexOf("импост ") != -1) {
        if (ipoints.indexOf(l) == -1) {
            ipoints.push(l - ox0);
        }
    }
});

//Добавим координату замка ручки как импост
var lockpoint; // = [];
if (elm.hho) {
    //lockpoint.push(elm.layer.h_ruch);
    lockpoint = elm.layer.h_ruch;
}

// добавляем точки от краёв и от импостов
if (offsets) {
    res.push(offsets);
    res.push(elm._attr._len - offsets);
}

if (sz > 0) {
    if ((imposts.outer.length) || (imposts.inner.length) || (elm.hho)) {
        for (let point of ipoints) {
            let left, right;
            left = (!res.some((p) => Math.abs(p - point - sz) < lmin));
            right = (!res.some((p) => Math.abs(p - point + sz) < lmin));

            if (left && right) {
                res.push(point.round(3) + sz);
                res.push(point.round(3) - sz);
            }
            if (left && !right) {
                res.push(point.round(3) + sz);
            }
            if (!left && right) {
                res.push(point.round(3) - sz);
            }
        } //for
    } //if imposts
} //if sz

if (sz == -1) {
    if ((imposts.outer.length) || (imposts.inner.length)) {
        for (let point of ipoints) {
            if (row_ins.coefficient > 5) {
                let coef2 = (row_ins.coefficient / 2).round(1);
                let left, right;

                left = (!res.some((p) => Math.abs(p - point - coef2) < coef2));
                right = (!res.some((p) => Math.abs(p - point + coef2) < coef2));

                if (left && right) {
                    res.push(point.round(3));
                }
                if (left && !right) {
                    res.push(point.round(3) + row_ins.coefficient);
                }
                if (!left && right) {
                    res.push(point.round(3) - row_ins.coefficient);
                }
            } else {
                res.push(point.round(3));
            }

        } //for
    } //if imposts
} //if sz

// Сортируем массив
res.sort((a, b) => a - b);

// если указан шаг, добавляем в свободные места
if (step) {
    for (var i = 0; i < res.length; i++) {
        let segment = res[i + 1] - res[i];
        let mpoints = (segment / step).round(0);
        if (mpoints >= 1) {
            let mstep = (segment / mpoints).round(3);
			if (mstep > step + 10) {
				mstep = (segment / (mpoints + 1) ).round(3);
			}
            for (let point = res[i] + mstep; point.round(0) < res[i + 1]; point += mstep) {
                // если шуруп попал в замок
                if (Math.abs(lockpoint - point) < sz) {
                    if (lockpoint - point < 0) {
                        mres.push(lockpoint.round(3) + sz);
                    } else {
                        mres.push(lockpoint.round(3) - sz);
                    }
                } else {
                    mres.push(point.round(3));
                }
            }
        }
    }
}
// слияние массивов (массив крайних точек и массив промежуточных точек)
[].push.apply(res,mres);
// сортируем и добавляем строки спецификации
res.sort((a, b) => a - b);
let add;
row_spec.qty = 0; //row_ins.quantity;
//row_spec.len = row_spec.len * (row_ins.coefficient || 0.001); //переводим мм в м.
row_spec.len = row_spec.len * 0.001; //переводим мм в м.

const {
    new_spec_row
} = $p.ProductsBuilding;
for (let point of res) {
    if (add) {
        row_spec = new_spec_row({
            row_base: row_ins,
            origin: inset,
            elm,
            ox,
            spec: ox.specification
        });
    }
    add = true;
    row_spec.len = point + dx0; // - ox0;
    //row_spec.len = row_spec.len * (row_ins.coefficient || 0.001); //переводим мм в м.
    row_spec.len = row_spec.len * 0.001; //переводим мм в м.

    // Если это номенклатура, то добавляем ее в спецификацию.
    if (row_spec.dop == 0) {
        row_spec.qty = row_ins.quantity;
        row_spec.totqty = row_spec.qty;
        row_spec.totqty1 = row_spec.totqty;
        row_spec.len = 0; //row_spec.len.round(3);
        if (elm.clr.clr_out) {
            row_spec.nom = row_ins.nom.by_clr_key && row_ins.nom.by_clr_key(elm.clr.clr_out);
        } else {
            row_spec.nom = row_ins.nom.by_clr_key && row_ins.nom.by_clr_key(elm.clr);
        }
    } else {
        row_spec.qty = 0;
    };
}

if (row_spec.qty == 0 && res.length == 0) {
    row_spec.dop = 0;
}
//return row_spec.qty;
