import "./style.css";

import React from "react";

const CardView = ({ className, children, secondary = false, onClick }) => {
  return (
    <div className={`card-view ${className} ${secondary ? "secondary" : ""}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default CardView;
