import React from 'react';
import './style.css';

const LabelValueBox = ({ label, value, className = "" }) => {
  return (
    <div className={`label-value-wrapper ${className}`}>
      <span className="label-value-wrapper-label">{label}</span>
      <span className="label-value-wrapper-value highlight">{value}</span>
    </div>
  );
};

export default LabelValueBox;