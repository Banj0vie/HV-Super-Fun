import "./style.css";

import React from "react";

const TokenBox = ({ token = "", onClick, clickable = false }) => {
  return (
    <div
      className={`token-box highlight ${clickable ? "clickable" : ""}`}
      onClick={onClick}
      style={{ cursor: clickable ? "pointer" : "default" }}
    >
      <img src="/images/input/token-label-bg.png" alt="token-box-bg" className="token-box-bg" />
      {token}
    </div>
  );
};

export default TokenBox;
