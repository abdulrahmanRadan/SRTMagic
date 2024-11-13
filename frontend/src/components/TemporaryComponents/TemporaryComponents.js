import React, { useEffect } from "react";

import "./TemporaryComponents.css";

const Temporary = () => {
  useEffect(() => {
    const colors = [
      "blue",
      "#2de1d6",
      "#5be12d",
      "#5be12d",
      "#5f116c",
      "#b1ad1d",
      "#db971d",
      "#851a05",
    ];
    const randomColors = [];
    while (randomColors.length < 3) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      if (!randomColors.includes(color)) {
        randomColors.push(color);
      }
    }
    document.documentElement.style.setProperty("--color1", randomColors[0]);
    document.documentElement.style.setProperty("--color2", randomColors[1]);
    document.documentElement.style.setProperty("--color3", randomColors[2]);
  }, []);
  return <div className="loading"></div>;
};

export default Temporary;
