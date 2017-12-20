// Отметимся в коносли
// console.log("Заявка на замер");
// если у организации индивидуальный шаблон, используем его, иначе - шаблон по умолчанию из формулы
debugger;
const tmpl_name = 'metering_application.docx';
const template = obj.organization._attachments && obj.organization._attachments[tmpl_name] ?
	await obj.organization.get_attachment(tmpl_name) :
	await this.get_attachment(tmpl_name);

// получаем word-шаблон из двоичных данных вложения
const docx = await $p.utils.docxtemplater(template);

// заполняем docx данными печати, полученными из документа Расчет
const pdata = await obj.print_data();

docx.setData(pdata);
docx.render();

// сохраняем файл договора, подмешивая номер документа в имя файла
docx.saveAs(`Заявка на замер ${obj.number_doc + (obj.number_internal ? ' ' + obj.number_internal : '')}.docx`);
