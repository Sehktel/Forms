// если у контрагента индивидуальный шаблон, используем его, иначе - шаблон по умолчанию из формулы
const tmpl_name = 'doc_yur_template.docx';
const template = obj.partner._attachments && obj.partner._attachments[tmpl_name] ?
	await obj.partner.get_attachment(tmpl_name):
	await this.get_attachment(tmpl_name);

// получаем word-шаблон из двоичных данных вложения
const docx = await $p.utils.docxtemplater(template);

// заполняем docx данными печати, полученными из документа Расчет
docx.setData(await obj.print_data());
docx.render();

// сохраняем файл договора, подмешивая номер документа в имя файла
docx.saveAs(`Договор ${obj.number_doc + (obj.number_internal ? ' ' + obj.number_internal : '')}.docx`);
