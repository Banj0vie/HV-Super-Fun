import React from "react";
import "./style.css";

const ExchangeButton = ({ onclick }) => {
  return (
    <div className="exchange-button">
      <img src="/images/button/exchange.png" alt="exchange-button-bg" className="exchange-button-bg" onClick={onclick} />
    </div>
  );
};

export default ExchangeButton;
