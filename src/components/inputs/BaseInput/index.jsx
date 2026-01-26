import React from "react";
import "./style.css";
import { generateId } from "../../../utils/basic";

const BaseInput = ({
  id = generateId(),
  className = "",
  type = "text",
  value = "",
  setValue,
  placeholder = "",
  maxLength = 32,
  primary = false,
}) => {
  return (
    <div className={`${className} base-input`}>
      <img src={primary ? "/images/input/primary-bg.png" : "/images/input/secondary-bg.png"} alt="input-bg" className="input-bg" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
};

export default BaseInput;
