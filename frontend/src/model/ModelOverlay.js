import React, { useRef } from "react";
import ReactDOM from "react-dom";
import "./Model.css";

const ModelOverlay = (props) => {
  const nodeRef = useRef(null);

  const content = (
    <div
      className={`modal ${props.className}`}
      style={props.style}
      ref={nodeRef}
    >
      <header className={`modal__header ${props.headerClass}`}>
        <h2>{props.header}</h2>
      </header>
      <form
        onSubmit={
          props.onSubmit ? props.onSubmit : (event) => event.preventDefault
        }
      >
        <div className={`modal__content ${props.contentClass}`}>
          {props.children}
        </div>
        <footer className={`modal__footer ${props.footerClass}`}>
          {props.footer}
        </footer>
      </form>
    </div>
  );
  return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
};

export default ModelOverlay;
