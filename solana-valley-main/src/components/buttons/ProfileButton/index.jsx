import "./style.css";

import React, { useEffect, useRef } from "react";

import { useAppSelector } from "../../../solana/store";
import { selectSettings } from "../../../solana/store/slices/uiSlice";
import { clampVolume } from "../../../utils/basic";
import { defaultSettings } from "../../../utils/settings";

const ProfileButton = ({ icon, text, title, ariaLabel, style, bg, onClick, disabled, className }) => {
  const baseClassName = `profile-btn${text ? " with-text" : " only-icon"}${disabled ? " disabled" : ""}`;
  const finalClassName = className ? `${baseClassName} ${className}` : baseClassName;
  const hoverAudioRef = useRef(null);
  const clickAudioRef = useRef(null);
  const settings = useAppSelector(selectSettings) || defaultSettings;

  useEffect(() => {
    if (!hoverAudioRef.current) {
      hoverAudioRef.current = new Audio("/sounds/ButtonHover.wav");
      hoverAudioRef.current.preload = "auto";
    }
  }, []);
  useEffect(() => {
    if (!clickAudioRef.current) {
      clickAudioRef.current = new Audio("/sounds/ButtonClick.wav");
      clickAudioRef.current.preload = "auto";
    }
  }, []);

  const handleClick = e => {
    if (disabled) return;
    const audio = clickAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
      audio.volume = clampVolume(volumeSetting);
      audio.play().catch(() => {});
    }
    if (onClick) onClick(e);
  };

  const handleKeyDown = e => {
    if (disabled) return;
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      const audio = clickAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
        audio.volume = clampVolume(volumeSetting);
        audio.play().catch(() => {});
      }
      onClick(e);
    }
  };

  return (
    <div
      className={finalClassName}
      title={title}
      aria-label={ariaLabel || title}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (disabled) return;
        const audio = hoverAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
        audio.volume = clampVolume(volumeSetting);
        audio.play().catch(() => {});
      }}
      style={style}
    >
      {bg && <img src={bg} alt="" className={`pb-bg${text ? "-with-text" : ""}`} aria-hidden="true" />}
      {icon ? (
        <span className="pb-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      {text ? <span className="pb-text">{text}</span> : null}
    </div>
  );
};

export default ProfileButton;
