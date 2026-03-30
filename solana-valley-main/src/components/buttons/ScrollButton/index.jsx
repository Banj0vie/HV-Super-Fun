import "./style.css";

import React, { useEffect, useRef } from "react";

import { useAppSelector } from "../../../solana/store";
import { selectSettings } from "../../../solana/store/slices/uiSlice";
import { clampVolume } from "../../../utils/basic";
import { defaultSettings } from "../../../utils/settings";
const ScrollButton = ({ className = "", label = "Button", onClick, disabled = false }) => {
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

  return (
    <div className={`${className} scroll-button-wrapper`}>
      <div
        className={`scroll-button ${disabled && "scroll-button-disabled"}`}
        onMouseEnter={() => {
          if (disabled) return;
          const audio = hoverAudioRef.current;
          if (!audio) return;
          audio.currentTime = 0;
          const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
          audio.volume = clampVolume(volumeSetting);
          audio.play().catch(() => {});
        }}
        onClick={e => {
          if (!disabled && typeof onClick === "function") {
            const audio = clickAudioRef.current;
            if (audio) {
              audio.currentTime = 0;
              const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
              audio.volume = clampVolume(volumeSetting);
              audio.play().catch(() => {});
            }
            onClick();
          }
        }}
      >
        <p>{label}</p>
      </div>
    </div>
  );
};

export default ScrollButton;
