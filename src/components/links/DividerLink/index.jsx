import React from "react";
import "./style.css";

const DividerLink = ({ label = "", link = "" }) => {
  return <div className='divider-link'>
    <div className="dl-divider"></div>
    <a className="dl-link" href={link}>{label}</a>
    <div className="dl-divider"></div>
  </div>;
};

export default DividerLink;
