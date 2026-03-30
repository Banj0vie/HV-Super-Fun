import "./style.css";

import React from "react";

const LabelValueBox = ({ label, value, className = "", children }) => {
  return (
    <div className={`label-value-wrapper ${className}`}>
      <span className="label-value-wrapper-label">{label}</span>
      <span className="label-value-wrapper-value highlight">
        {children}
        {value}
      </span>
    </div>
  );
};

export default LabelValueBox;
