import React from "react";
import "./style.css";

const ExchangeButton = ({ onclick }) => {
  return (
    <div
      className="exchange-button"
      onClick={(e) => {
        onclick();
      }}
    >
      <p>⇅</p>
    </div>
  );
};

export default ExchangeButton;
