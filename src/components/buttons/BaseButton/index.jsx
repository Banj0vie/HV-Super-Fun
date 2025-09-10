import React from "react";
import "./style.css";

const BaseButton = ({ label = "Button", onClick }) => {
  return (
    <div className="base-button-wrapper">
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
