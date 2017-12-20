var templates = this._template.content.innerHTML,
    doc = new $p.SpreadsheetDocument();

debugger;
console.log("КП_Евроокна");

// последовательно выполняем вложенные формулы Приложений 1 и 2
// this.params.forEach((row) => row.value.execute(obj));

let f1 = this.params.get(1);
let f2 = this.params.get(2);

f1.value.execute(obj, $p);
f2.value.execute(obj, $p);

// Выводим Листы КП

return obj.print_data().then((res) => {
    doc.put(templates, templates.attributes);
    return doc;
});
