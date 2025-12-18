import React from "react";
import "./style.css";

const BaseButton = ({
  className = "",
  label = "Button",
  onClick,
  disabled = false,
  focused = false,
  isError = false,
}) => {
  return (
    <div className={`${className} base-button-wrapper`}>
      <div
        className={`base-button ${disabled && "base-button-disabled"} ${focused && "base-button-focused"}`}
        onClick={(e) => {
          if (!disabled && typeof onClick === 'function') {
            onClick();
          }
        }}
      >
        <img className="base-button-bg" src={isError ? "/images/button/base_button_error_bg.png" : "/images/button/base_button_bg.png"} alt="base-button-image" />
        <p>{label}</p>
      </div>
    </div>
  );
};

export default BaseButton;
