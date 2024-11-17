import React, { useEffect, useState } from "react";
import "./ProgressAnimation.css";

const ProgressAnimation = ({ progress, reset }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (reset) {
      setDisplayProgress(0); // إعادة التعيين عند بدء ترجمة ملف جديد
    }
    // تأكد من تحديث التقدم بمرور الوقت باستخدام requestAnimationFrame
    const animateProgress = () => {
      if (displayProgress < progress) {
        setDisplayProgress((prev) => Math.min(prev + 1, progress));
        requestAnimationFrame(animateProgress);
      } else if (displayProgress > progress) {
        setDisplayProgress((prev) => Math.max(prev - 1, progress));
        requestAnimationFrame(animateProgress);
      }
    };

    animateProgress();
  }, [progress, reset, displayProgress]);

  return (
    <div className="progress-container">
      <div className="progress-bar-background">
        <div
          className="progress-bar"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      <p className="progress-text">{displayProgress}%</p>
    </div>
  );
};

export default ProgressAnimation;
