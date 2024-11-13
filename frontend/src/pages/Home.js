import React, { useState, useEffect } from "react";
import axios from "axios";
import TemporaryComponents from "../components/TemporaryComponents/TemporaryComponents";
import Header from "../components/header/Header";
// import Model from "../model/Model";
import "./Home.css";

const Home = () => {
  const [showOriginal, setShowOriginal] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOriginal(true);
    }, 5000); // 5000 milliseconds = 5 seconds
    return () => clearTimeout(timer);
  }, []);

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
          responseType: "blob", // تحويل الاستجابة إلى Blob للتنزيل
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      // إعداد الملف كتنزيل في المتصفح
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name.replace(".srt", "_arabic.srt"));
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("Translation complete! The file is downloading...");
      setProgress(100);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        console.error("Error during file upload:", error);
        setMessage("Translation failed. Please try again.");
      }
    }
  };

  useEffect(() => {
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
    <div className="root">
      {showOriginal ? (
        <React.Fragment>
          <Header />
          <div className="main-page">
            <div className="wrapper">
              <h1 className="text">Welcome to SRT Translator!</h1>
            </div>
            <input type="file" accept=".srt" onChange={handleFileChange} />
            <button onClick={handleUpload}>Translate</button>
            <p>{message}</p>
            <p>Progress: {progress}%</p>
          </div>
        </React.Fragment>
      ) : (
        <TemporaryComponents />
      )}
    </div>
  );
};

export default Home;
