const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const translate = require("google-translate-api-x");

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

async function translateLines(lines, targetLang, originalLang) {
  const translatedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDialogue(line)) {
      const translated = await translateWithRetry(
        line,
        targetLang,
        originalLang
      );
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
  // console.log("Original Language: ", originalLang); // طباعة اللغة الأصلية
  // console.log("Target Language: ", targetLang);
  if (!file) return res.status(400).send("Please upload a file");

  const filePath = path.resolve(file.path);
  const srtContent = fs.readFileSync(filePath, "utf-8");
  const srtLines = srtContent.split("\n");

  const translatedLines = await translateLines(
    srtLines,
    targetLang,
    originalLang
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
