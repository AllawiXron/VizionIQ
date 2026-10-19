// The PowerPoint for the competition (rule 5): out/ministry-identity-proposal.pptx.
// Each slide is the rendered PNG from out/ (slides 1–13), full bleed, because the identity's fonts (Readex Pro,
// IBM Plex Sans Arabic) won't be installed on the judges' computers and live text would fall back and break the
// layout. Every slide carries a presenter script in its notes. The closing slide has one editable text box (Arial)
// for the designer's name and contact (rule 6).
//   NODE_PATH=<dir with pptxgenjs> node deck.cjs
const pptxgen = require('pptxgenjs');
const path = require('path');

const NOTES = [
  'السلام عليكم. أقدّم لكم مقترح الهوية البصرية لوزارة الاقتصاد الرقمي والحوكمة، بعنوان: بوابة عشتار.. بوابة العراق الرقمية.',
  'الفكرة: بوابة عشتار في بابل من أشهر المداخل في تاريخ العراق، والوزارة اليوم هي بوابة الدولة الرقمية التي تمرّ منها الخدمات إلى المواطن. القوسان الذهبيان يستلهمان أقواس مدخل البوابة، وهما أيضاً موجات الاتصال. والشرفات المدرّجة من العمارة الرافدينية، ودرجاتها المربّعة تشبه البكسل. فيجمع الشعار الهوية العراقية والاقتصاد الرقمي والحوكمة والابتكار في شكل واحد.',
  'نسخ الشعار: النسخة الأفقية الأساسية، والنسخة العمودية، والنسخة على الخلفيات الداكنة، ونسخة بلون واحد للأختام والطباعة، وأيقونة للتطبيقات.',
  'البناء: البرجان متساويان، والجدار بعرض برجين ونصف، والمدخل والقوسان الذهبيان من مركز واحد بمسافات ثابتة، وكل شرفة ثلاث درجات بنسب ثابتة. وهذا يجعل الشعار متّزناً وسهل الإعادة بدقة في كل الاستخدامات.',
  'الألوان: أزرق بابل من الطابوق المزجّج في بوابة عشتار، ويرمز إلى الثقة والاستقرار. وحبر الليل للنصوص والخلفيات الرسمية. وذهب عشتار لون الأقواس، ويُستعمل بقدر محسوب. والطين لون الأرض الرافدينية للمطبوعات. أما الخطوط فهي Readex Pro للعناوين وIBM Plex Sans Arabic للنصوص، وكلاهما مجاني ومفتوح الترخيص.',
  'العناصر الرسومية: اشتققنا من الشعار نقشين؛ شريط الشرفات للحواف والفواصل، ونقش الأقواس للأغلفة والخلفيات الكبيرة. وبهما تبقى الهوية متماسكة حتى من دون الشعار.',
  'المراسلات الرسمية: الورق الرسمي والظرف وبطاقة العمل، بشريط الشرفات وألوان الهوية، بشكل رسمي ونظيف.',
  'هوية الموظف والتطبيق: بطاقة تعريف الموظف، وشاشة افتتاح التطبيق، وأيقونته على الهاتف.',
  'المنصّات الرقمية: نماذج لمنشورات وقصص بالهوية نفسها. والنصوص فيها للتوضيح.',
  'اللوحات: لوحة واجهة المبنى بمدخل مقوّس يكرّر فكرة الشعار، ولوحة إرشاد داخلية.',
  'الموقع الإلكتروني: الصفحة الرئيسية مبنية كبوابة فعلية للخدمات؛ البحث عن الخدمة أولاً، ثم الخدمات الأكثر طلباً، مع نسخة للهاتف.',
  'تجربة الاستخدام: مثال تسجيل شركة جديدة؛ صفحة موحّدة لكل خدمة تبيّن المتطلبات والخطوات، ثم متابعة واضحة لحالة الطلب خطوة بخطوة تعزيزاً للشفافية.',
  'من بوابة بابل التي استقبلت العالم قبل أكثر من ألفين وخمسمئة عام، إلى بوابة رقمية تستقبل كل مواطن عراقي اليوم. شكراً لكم.',
];

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';          // 10 x 5.625 in
  pres.title = 'مقترح الهوية البصرية: وزارة الاقتصاد الرقمي والحوكمة';
  pres.subject = 'بوابة عشتار.. بوابة العراق الرقمية';
  pres.rtlMode = true;
  NOTES.forEach((note, i) => {
    const slide = pres.addSlide();
    slide.background = { color: '0C1B40' };
    slide.addImage({ path: path.join(__dirname, 'out', `slide-${i + 1}.png`), x: 0, y: 0, w: 10, h: 5.625,
      altText: i === 0 ? 'غلاف: شعار بوابة عشتار واسم الوزارة' : `الشريحة ${i + 1}` });
    if (i === NOTES.length - 1) {
      // over the gold rule in closing.html (top 760px of 1080, 900px wide)
      slide.addText([
        { text: 'اسم المصمم', options: { fontSize: 20, bold: true, breakLine: true } },
        { text: 'الهاتف · البريد الإلكتروني · الحساب', options: { fontSize: 13 } },
      ], { x: 2.66, y: 4.02, w: 4.69, h: 0.66, align: 'center', valign: 'middle', color: 'ECE2D0', fontFace: 'Arial',
        rtlMode: true, lang: 'ar-IQ', margin: 0, isTextBox: true, objectName: 'designer-contact' });
    }
    slide.addNotes(note);
  });
  await pres.writeFile({ fileName: path.join(__dirname, 'out', 'ministry-identity-proposal.pptx') });
  console.log('out/ministry-identity-proposal.pptx');
})();
