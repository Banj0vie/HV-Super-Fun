import "./style.css";

import React from "react";

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <div className="loading-content">
        <img src="/images/loading/loading.png" alt="Loading" className="loading-image" />
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
