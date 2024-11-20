// topicDetector.js
const fs = require("fs");
const natural = require("natural");

function detectTopicAndTerms(filePath, fileName) {
  // قراءة محتوى الملف
  const text = fs.readFileSync(filePath, "utf-8");

  // دمج محتوى الملف مع اسم الملف
  const combinedText = `${fileName} ${text}`;

  // استخدام مكتبة Natural لمعالجة النصوص
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(combinedText);

  // تحويل الكلمات إلى أحرف صغيرة لسهولة المطابقة
  const wordsLowerCase = words.map((word) => word.toLowerCase());

  // إزالة الكلمات الشائعة (Stop Words)
  const stopWords = natural.stopwords;
  const filteredWords = wordsLowerCase.filter(
    (word) => !stopWords.includes(word)
  );

  // قائمة بالمصطلحات التقنية المعروفة
  const knownTechnicalTerms = [
    "javascript",
    "node.js",
    "function",
    "variable",
    "class",
    "object",
    "array",
    "async",
    "await",
    "promise",
    "callback",
    "api",
    "json",
    "http",
    "express",
    "react",
    "angular",
    "vue",
    "typescript",
    "compiler",
    "interpreter",
    "algorithm",
    "data structure",
    "database",
    "sql",
    "nosql",
    "mongodb",
    "mysql",
    "python",
    "java",
    "c++",
    "c#",
    "ruby",
    "php",
    "html",
    "css",
    "git",
    "github",
    "docker",
    "kubernetes",
    "linux",
    "windows",
    "macos",
    "machine learning",
    "artificial intelligence",
    "neural network",
    "deep learning",
    "nlp",
    "computer vision",
    "cloud",
    "aws",
    "azure",
    "google cloud",
    "devops",
    "ci/cd",
    "test",
    "debug",
    "deploy",
    // يمكنك إضافة المزيد من المصطلحات حسب الحاجة
  ];

  // تحويل قائمة المصطلحات التقنية إلى Set لتحسين الأداء في البحث
  const technicalTermsSet = new Set(knownTechnicalTerms);

  // استخراج المصطلحات التقنية من الكلمات المستخرجة
  const technicalTerms = filteredWords.filter((word) =>
    technicalTermsSet.has(word)
  );

  // إزالة التكرارات من قائمة المصطلحات التقنية
  const uniqueTechnicalTerms = [...new Set(technicalTerms)];

  return uniqueTechnicalTerms;
}

module.exports = { detectTopicAndTerms };
