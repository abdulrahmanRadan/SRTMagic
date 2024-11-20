const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const translate = require("google-translate-api-x");
const { detectTopicAndTerms } = require("./topicDetector"); // استيراد دالة تحديد الموضوع

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

async function translateLines(lines, targetLang, originalLang, topics) {
  const translatedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDialogue(line)) {
      // استبدال المصطلحات بعلامات مؤقتة
      let modifiedLine = line;
      const placeholders = {};

      topics.forEach((term, index) => {
        const placeholder = `__TERM_${index}__`;
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        if (regex.test(modifiedLine)) {
          modifiedLine = modifiedLine.replace(regex, placeholder);
          placeholders[placeholder] = term;
        }
      });

      const translated = await translateWithRetry(
        line,
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

      translatedLines.push(translated);
    } else {
      translatedLines.push(line);
    }

    const progress = ((i + 1) / lines.length) * 100;
    sendProgressUpdate(progress.toFixed(2));
  }
  return translatedLines;
}

app.post("/translate", upload.single("file"), async (req, res) => {
  const { file } = req;
  const originalLang = req.body.originalLanguage || "en";
  const targetLang = req.body.targetLanguage || "ar";
  if (!file) return res.status(400).send("Please upload a file");

  const filePath = path.resolve(file.path);
  const srtContent = fs.readFileSync(filePath, "utf-8");
  const srtLines = srtContent.split("\n");

  // استدعاء دالة تحديد الموضوع
  const topics = detectTopicAndTerms(filePath, file.originalname);
  console.log("Detected Topics:", topics);

  const translatedLines = await translateLines(
    srtLines,
    targetLang,
    originalLang,
    topics
  );

  // إعداد الملف كاستجابة قابلة للتنزيل
  const translatedFileName = `${file.originalname.replace(
    ".srt",
    `_${targetLang}.srt`
  )}`;
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${translatedFileName}`
  );
  res.setHeader("Content-Type", "text/srt");
  res.send(translatedLines.join("\n"));
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
