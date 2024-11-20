const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const translate = require("google-translate-api-x");
const { detectTechnicalTerms } = require("./topicDetector"); // استيراد دالة تحديد الموضوع

const app = express();
const upload = multer({ dest: "uploads/" });

let clients = [];

app.use(cors());

app.get("/progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

function sendProgressUpdate(progress) {
  clients.forEach((client) => client.write(`data: ${progress}\n\n`));
}

function isDialogue(line) {
  return !line.includes("-->") && line.trim() && isNaN(line);
}

async function translateWithRetry(
  text,
  targetLang,
  originalLang,
  maxRetries = 5
) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const res = await translate(text, { from: originalLang, to: targetLang });
      return res.text;
    } catch (error) {
      retries += 1;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return text;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function translateLines(lines, targetLang, originalLang, termsToKeep) {
  const translatedLines = [];
  const termsSet = new Set(termsToKeep.map((term) => term.toLowerCase()));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDialogue(line)) {
      // استبدال المصطلحات بعلامات مؤقتة
      let modifiedLine = line;
      const placeholders = {};
      let index = 0;

      termsSet.forEach((term) => {
        const placeholder = `__TERM_${index}__`;
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        if (regex.test(modifiedLine)) {
          modifiedLine = modifiedLine.replace(regex, placeholder);
          placeholders[placeholder] = term;
          index++;
        }
      });

      const translated = await translateWithRetry(
        modifiedLine,
        targetLang,
        originalLang
      );
      // إعادة المصطلحات إلى النص المترجم
      let finalTranslation = translated;
      Object.keys(placeholders).forEach((placeholder) => {
        const term = placeholders[placeholder];
        const regex = new RegExp(placeholder, "g");
        finalTranslation = finalTranslation.replace(regex, term);
      });

      translatedLines.push(escapeHtml(finalTranslation));
    } else {
      translatedLines.push(line);
    }

    const progress = ((i + 1) / lines.length) * 100;
    sendProgressUpdate(progress.toFixed(2));
  }
  return translatedLines;
}

// في ملفك الرئيسي أو يمكنك وضعه في ملف منفصل واستيراده
async function processTranslation(file, originalLang, targetLang) {
  const validLanguages = ["en", "ar", "es", "fr", "de", "it", "ru", "zh", "ja"]; // أضف المزيد حسب الحاجة

  // التحقق من وجود الملف
  if (!file) throw new Error("Please upload a file");

  // التحقق من امتداد الملف (السماح فقط بملفات SRT)
  if (path.extname(file.originalname).toLowerCase() !== ".srt") {
    throw new Error("Only .srt files are allowed");
  }

  // التحقق من رموز اللغات
  if (
    !validLanguages.includes(originalLang) ||
    !validLanguages.includes(targetLang)
  ) {
    throw new Error("Invalid language code");
  }

  const filePath = path.resolve(file.path);
  let srtContent = fs.readFileSync(filePath, "utf-8");

  // تنظيف محتوى الملف لإزالة أي نصوص ضارة محتملة
  srtContent = srtContent.replace(/<[^>]*>?/gm, "");
  srtContent = srtContent
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const srtLines = srtContent.split("\n");

  // استدعاء دالة تحديد المصطلحات التقنية
  const termsToKeep = detectTechnicalTerms(filePath, file.originalname);
  console.log("Terms to Keep Untranslated:", termsToKeep);

  // ترجمة السطور
  const translatedLines = await translateLines(
    srtLines,
    targetLang,
    originalLang,
    termsToKeep
  );

  // إعداد الملف المترجم
  const translatedFileName = `${file.originalname.replace(
    ".srt",
    `_${targetLang}.srt`
  )}`;

  // إعادة النتائج
  return {
    translatedContent: translatedLines.join("\n"),
    translatedFileName,
  };
}

app.post("/translate", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const originalLang = req.body.originalLanguage || "en";
    const targetLang = req.body.targetLanguage || "ar";

    // استدعاء الدالة المنفصلة
    const { translatedContent, translatedFileName } = await processTranslation(
      file,
      originalLang,
      targetLang
    );

    // إعداد الملف كاستجابة قابلة للتنزيل
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${translatedFileName}`
    );
    res.setHeader("Content-Type", "text/srt");
    res.send(translatedContent);
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
