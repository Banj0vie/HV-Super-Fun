import React from 'react';
import './style.css';

const TooltipButton = ({ label, style, className = '', onClick, "data-hotspot": dataHotspot, frameSrc }) => {
  const combinedClass = `tooltip-btn ${className}`.trim();
  const backgroundImage = frameSrc || '/images/backgrounds/tooltip_bg.png';
  return (
    <div
      className={combinedClass}
      style={{ backgroundImage: `url(${backgroundImage})`, ...style }}
      onClick={onClick}
      data-hotspot={dataHotspot}
    >
      <span>{label}</span>
    </div>
  );
};

export default TooltipButton;


