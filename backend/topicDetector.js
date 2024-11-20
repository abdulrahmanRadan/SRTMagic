// topicDetector.js
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

  // إزالة التكرارات وتحويلها إلى أحرف صغيرة
  terms = [...new Set(terms.map((term) => term.toLowerCase()))];

  return terms;
}

module.exports = { detectTechnicalTerms };
