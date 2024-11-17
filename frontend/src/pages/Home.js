import React, { useState, useEffect } from "react";
import axios from "axios";
import TemporaryComponents from "../components/TemporaryComponents/TemporaryComponents";
import Header from "../components/header/Header";
import Dropdown from "../components/Dropdown";
import "./Home.css";
// import TranslateButton from "../components/TranslateButton";

const Home = () => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOriginal(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  // القيم الافتراضية للقوائم تكون فارغة
  const [originalLanguage, setOriginalLanguage] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "Arabic" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "it", name: "Italian" },
    { code: "ru", name: "Russian" },
  ];

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !originalLanguage || !targetLanguage) {
      setMessage("Please make sure to select all required inputs.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("originalLanguage", originalLanguage.code);
    formData.append("targetLanguage", targetLanguage.code);

    try {
      const response = await axios.post(
        "http://localhost:3001/translate",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        file.name.replace(".srt", `_translated_${targetLanguage.code}.srt`)
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("Translation complete! The file is downloading...");
      setProgress(100);
    } catch (error) {
      setMessage("Translation failed. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="root">
      {showOriginal ? (
        <>
          <Header />
          <div className="main-page">
            <div className="wrapper">
              <h1 className="text">Welcome to SRT Translator!</h1>
            </div>

            <input type="file" accept=".srt" onChange={handleFileChange} />
            <div className="dropdown-wrapper">
              <Dropdown
                label="Original Language"
                options={languages}
                selectedValue={originalLanguage}
                onSelect={setOriginalLanguage}
              />

              {/* Dropdown لاختيار اللغة المراد الترجمة إليها */}
              <Dropdown
                label="Target Language"
                options={languages}
                selectedValue={targetLanguage}
                onSelect={setTargetLanguage}
              />
            </div>

            <button
              className="translate-button"
              onClick={handleUpload}
              disabled={
                isUploading || !file || !originalLanguage || !targetLanguage
              }
            >
              Translate
            </button>
            <p>Progress: {progress}%</p>
            <p>{message}</p>
          </div>
        </>
      ) : (
        <TemporaryComponents />
      )}
    </div>
  );
};

export default Home;
