const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const translate = require("google-translate-api-x");

const app = express();
const upload = multer({ dest: "uploads/" });

let clients = [];

// تفعيل CORS لجميع الطلبات
app.use(cors());

// إعداد SSE لتحديثات التقدم
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

async function translateWithRetry(text, targetLang, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const res = await translate(text, { to: targetLang });
      return res.text;
    } catch (error) {
      retries += 1;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return text;
}

async function translateLines(lines, targetLang) {
  const translatedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isDialogue(line)) {
      const translated = await translateWithRetry(line, targetLang);
      translatedLines.push(translated);
    } else {
      translatedLines.push(line);
    }

    const progress = ((i + 1) / lines.length) * 100;
    sendProgressUpdate(progress.toFixed(2));
  }
  return translatedLines;
}

// مسار للترجمة
app.post("/translate", upload.single("file"), async (req, res) => {
  const { file } = req;
  const targetLang = "ar";

  if (!file) return res.status(400).send("Please upload a file");

  const filePath = path.resolve(file.path);
  const srtContent = fs.readFileSync(filePath, "utf-8");
  const srtLines = srtContent.split("\n");

  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const outputPath = path.join(
    outputDir,
    `${file.originalname.replace(".srt", "_arabic.srt")}`
  );

  // التحقق مما إذا كان الملف قد تم ترجمته مسبقًا
  if (fs.existsSync(outputPath)) {
    return res.status(400).json({ message: "الملف موجود مسبقًا" });
  }

  const translatedLines = await translateLines(srtLines, targetLang);

  fs.writeFileSync(outputPath, translatedLines.join("\n"), "utf-8");

  sendProgressUpdate(100);

  res.json({ message: "Translation complete", path: outputPath });
});

// بدء الخادم
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
