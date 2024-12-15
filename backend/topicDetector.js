const fs = require("fs");
const nlp = require("compromise");

function detectTechnicalTerms(filePath, fileName) {
  // قراءة محتوى الملف
  const text = fs.readFileSync(filePath, "utf-8");
  const combinedText = `${fileName} ${text}`;

  // معالجة النص باستخدام compromise
  const doc = nlp(combinedText);

  // استخراج الأسماء (كلمات قد تكون مصطلحات تقنية)
  let terms = doc.nouns().out("array");

  // فلترة المصطلحات للتخلص من التكرار والرموز والتنسيقات الزمنية
  terms = terms.filter((term) => {
    // استبعاد الرموز الخاصة مثل --> أو غيرها
    if (/-->/.test(term)) return false;

    // استبعاد النصوص التي تحتوي على أرقام
    if (/\d/.test(term)) return false;

    // استبعاد النصوص التي تحتوي على رموز خاصة
    if (/[^a-zA-Z\s]/.test(term)) return false;

    // استبعاد الكلمات القصيرة جدًا (مثال: أقل من 3 حروف)
    if (term.length < 3) return false;

    return true;
  });

  // إزالة التكرارات وتحويلها إلى أحرف صغيرة
  terms = [...new Set(terms.map((term) => term.toLowerCase()))];

  // إضافة مصطلحات يدوية إلى القائمة
  const manualTerms = [
    "route",
    "routes",
    "nodejs",
    "node",
    "expressjs",
    "express",
    "react",
    "json",
    "frontend",
    "front end",
  ];

  const finalTerms = [...new Set([...terms, ...manualTerms])];

  return finalTerms;
}

module.exports = { detectTechnicalTerms };
