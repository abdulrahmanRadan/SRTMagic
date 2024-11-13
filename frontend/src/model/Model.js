import React, { useRef } from "react";
import { CSSTransition } from "react-transition-group";

import Backdrop from "./components/Backdrop";
import ModelOverlay from "./ModelOverlay";

const Model = (props) => {
  const nodeRef = useRef(null);

  return (
    <React.Fragment>
      {props.show && <Backdrop onClick={props.onCancel} />}
      <CSSTransition
        in={props.show}
        mountOnEnter
        unmountOnExit
        timeout={200}
        classNames={"modal"}
        nodeRef={nodeRef}
      >
        <ModelOverlay {...props} />
      </CSSTransition>
    </React.Fragment>
  );
};

export default Model;
