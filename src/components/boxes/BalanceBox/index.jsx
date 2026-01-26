import React from "react";
import "./style.css";

const BalanceBox = ({ balance = "0.00", onClick, clickable = false }) => {
  return (
    <p 
      className={`balance-box ${clickable ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <img src="/images/input/token-label-bg.png" alt="balance-bg" className="balance-box-bg" />
      {balance}
    </p>
  );
};

export default BalanceBox;
