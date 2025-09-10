import React, { useState } from "react";
import "./style.css";
import { generateId } from "../../../utils/basic";

const BaseInput = ({
  id = generateId(),
  className = "",
  type = "text",
  value = "",
  setValue, 
  placeholder = "",
}) => {
  return (
    <div className={`${className} base-input`}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.value);
        }}
      />
    </div>
  );
};

export default BaseInput;
