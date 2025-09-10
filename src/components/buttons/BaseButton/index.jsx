import React from "react";
import "./style.css";

const BaseButton = ({ className="", label = "Button", onClick }) => {
  return (
    <div className={`${className} base-button-wrapper`}>
      <div
        className="base-button"
        onClick={(e) => {
          onClick();
        }}
      >
        <p>{label}</p>
      </div>
    </div>
  );
};

export default BaseButton;
