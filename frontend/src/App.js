import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/translate",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      // عرض الرسالة من الخادم
      setMessage(`Translation complete! File saved at: ${response.data.path}`);
      setProgress(100); // تعيين التقدم إلى 100 عند اكتمال الترجمة
    } catch (error) {
      // التحقق من رسالة الخطأ من الخادم
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        console.error("Error during file upload:", error);
        setMessage("Translation failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    // فتح اتصال SSE لتلقي تحديثات التقدم
    const eventSource = new EventSource("http://localhost:3001/progress");

    eventSource.onmessage = (event) => {
      setProgress(parseFloat(event.data));
    };

    eventSource.onerror = (error) => {
      console.error("Error with SSE connection:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>SRT Translator</h1>
      <input type="file" accept=".srt" onChange={handleFileChange} />
      <button onClick={handleUpload}>Translate</button>
      <p>{message}</p>
      <p>Progress: {progress}%</p>
    </div>
  );
}

export default App;
