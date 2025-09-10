import React from "react";
import "./style.css";

const Slider = ({ min = "0", max = "15", step = "1", value, setValue }) => {
  return (
    <div className="slider-background">
      <input
        className="slider-input"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></input>
    </div>
  );
};

export default Slider;
