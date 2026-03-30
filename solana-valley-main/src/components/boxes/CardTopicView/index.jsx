import "./style.css";

import React from "react";

const CardTopicView = ({ title, className = "", width = "50%" }) => {
  return (
    <div className={`card-topic-view ${className}`} style={{ width }}>
      <img src="/images/label/grey-bg.png" alt="grey-bg" className="card-topic-view-bg" />
      <span>{title}</span>
    </div>
  );
};

export default CardTopicView;
