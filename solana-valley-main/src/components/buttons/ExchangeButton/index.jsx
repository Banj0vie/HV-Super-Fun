import "./style.css";

import React, { useEffect, useRef } from "react";

import { useAppSelector } from "../../../solana/store";
import { selectSettings } from "../../../solana/store/slices/uiSlice";
import { clampVolume } from "../../../utils/basic";
import { defaultSettings } from "../../../utils/settings";

const ExchangeButton = ({ onclick }) => {
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
    <div
      className="exchange-button"
      onMouseEnter={() => {
        const audio = hoverAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
        audio.volume = clampVolume(volumeSetting);
        audio.play().catch(() => {});
      }}
    >
      <img
        src="/images/button/exchange.png"
        alt="exchange-button-bg"
        className="exchange-button-bg"
        onClick={event => {
          const audio = clickAudioRef.current;
          if (audio) {
            audio.currentTime = 0;
            const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
            audio.volume = clampVolume(volumeSetting);
            audio.play().catch(() => {});
          }
          if (onclick) onclick(event);
        }}
      />
    </div>
  );
};

export default ExchangeButton;
