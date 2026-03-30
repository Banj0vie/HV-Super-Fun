/* eslint-disable jsx-a11y/img-redundant-alt */
import "./style.css";

import React from "react";

const BaseSelect = ({ className, options, value, setValue }) => {
  return (
    <div className={`${className} base-select`}>
      <img src="/images/input/select-bg.png" className="base-select-bg" alt="base image background" />
      <select value={value} onChange={e => setValue(e.target.value)}>
        {options.map((option, index) => (
          <option key={index} value={option.value} selected={option.value === value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BaseSelect;
