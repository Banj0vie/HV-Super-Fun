import "./style.css";

import React, { useEffect, useRef } from "react";

import { useAppSelector } from "../../../solana/store";
import { selectSettings } from "../../../solana/store/slices/uiSlice";
import { clampVolume } from "../../../utils/basic";
import { defaultSettings } from "../../../utils/settings";

const TooltipButton = ({
  label,
  style,
  className = "",
  onClick,
  "data-hotspot": dataHotspot,
  frameSrc,
  onMouseEnter,
  onMouseLeave,
}) => {
  const combinedClass = `tooltip-btn ${className}`.trim();
  const backgroundImage = frameSrc || "/images/backgrounds/tooltip_bg.png";
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

  const handleMouseEnter = event => {
    const audio = hoverAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
      audio.volume = clampVolume(volumeSetting);
      audio.play().catch(() => {});
    }
    if (onMouseEnter) onMouseEnter(event);
  };

  const handleMouseLeave = event => {
    if (onMouseLeave) onMouseLeave(event);
  };
  const handleClick = event => {
    const audio = clickAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
      audio.volume = clampVolume(volumeSetting);
      audio.play().catch(() => {});
    }
    if (onClick) onClick(event);
  };
  return (
    <div
      className={combinedClass}
      style={{ backgroundImage: `url(${backgroundImage})`, ...style }}
      onClick={handleClick}
      data-hotspot={dataHotspot}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span>{label}</span>
    </div>
  );
};

export default TooltipButton;
