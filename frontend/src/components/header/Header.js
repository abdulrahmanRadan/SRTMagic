// Header.js
import React from "react";
import "./Header.css";

const Header = (props) => {
  return (
    <header className={`header ${props.header}`}>
      <h1 className="text">SRT Magic </h1>
    </header>
  );
};

export default Header;
