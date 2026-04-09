import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const MenuItem = ({ path, icon, label, labelIcon, iconScale, isActive }) => {
  const clickAudioRef = useRef(null);

  useEffect(() => {
    if (!clickAudioRef.current) {
      clickAudioRef.current = new Audio("/sounds/ButtonHover.wav");
      clickAudioRef.current.preload = "auto";
    }
  }, []);

  return (
    <Link
      to={path}
      className={`menu-item ${isActive ? 'active' : ''}`}
      onClick={() => {
        const audio = clickAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }}
    >
      <div className="menu-icon">
        <img src={icon} alt={label} className="menu-icon-img" style={iconScale ? { width: `${iconScale * 100}%`, height: `${iconScale * 100}%` } : undefined} />
        {labelIcon && <img src={labelIcon} alt={`${label} label`} style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', width: '70%', pointerEvents: 'none' }} />}
      </div>
    </Link>
  );
}

export default MenuItem;
