import React from "react";
import "./style.css";

const DividerLink = ({ label = "", link = "" }) => {
  return <div className='divider-link'>
    <div className="dl-divider"></div>
    <div className="dl-link">
      <img src="/images/input/token-input-bg.png" alt="divider-link-bg" className="divider-link-bg" />
      <a className="highlight" href={link}>{label}</a>
    </div>
    <div className="dl-divider"></div>
  </div>;
};

export default DividerLink;
