import React from "react";
import "./style.css";

const BalanceBox = ({ balance = "0.00" }) => {
  return <p className="balance-box">{balance}</p>;
};

export default BalanceBox;
