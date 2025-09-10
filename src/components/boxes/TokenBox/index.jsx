import React from "react";
import "./style.css";

const TokenBox = ({ token = "" }) => {
  return <div className="token-box highlight">{token}</div>;
};

export default TokenBox;
