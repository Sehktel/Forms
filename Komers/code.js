
// последовательно выполняем вложенные формулы
//this.params.forEach((row) => row.value.execute(obj));
debugger;

let f1 = this.params.get(1);
let f2 = this.params.get(2);

f1.value.execute(obj, $p);
f2.value.execute(obj, $p);
