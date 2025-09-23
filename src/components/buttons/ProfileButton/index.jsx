import React from 'react';
import './style.css';
import { profileAssets } from '../../../constants/_baseimages';

const ProfileButton = ({ icon, text, title, ariaLabel, style, bg, onClick, disabled }) => {
  const backgroundUrl = bg || profileAssets.buttonBg;
  const className = `profile-btn${text ? ' with-text' : ' only-icon'}${disabled ? ' disabled' : ''}`;
  
  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={className}
      title={title}
      aria-label={ariaLabel || title}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={bg ? { '--profile-btn-bg': `url(${backgroundUrl})`, ...style } : style}
    >
      {icon ? <span className="pb-icon" aria-hidden>{icon}</span> : null}
      {text ? <span className="pb-text">{text}</span> : null}
    </div>
  );
};

export default ProfileButton;


