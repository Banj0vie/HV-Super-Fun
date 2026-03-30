import "./style.css";

import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { useAppSelector } from "../../../solana/store";
import { selectSettings } from "../../../solana/store/slices/uiSlice";
import { clampVolume } from "../../../utils/basic";
import { defaultSettings } from "../../../utils/settings";
const MenuItem = ({ path, icon, label, isActive }) => {
  const hoverAudioRef = useRef(null);
  const clickAudioRef = useRef(null);

  useEffect(() => {
    if (!hoverAudioRef.current) {
      hoverAudioRef.current = new Audio("/sounds/ButtonHover.wav");
      hoverAudioRef.current.preload = "auto";
    }
    if (!clickAudioRef.current) {
      clickAudioRef.current = new Audio("/sounds/ButtonClick.wav");
      clickAudioRef.current.preload = "auto";
    }
  }, []);
  const settings = useAppSelector(selectSettings) || defaultSettings;

  return (
    <Link
      to={path}
      className={`menu-item ${isActive ? "active" : ""}`}
      onMouseEnter={() => {
        const audio = hoverAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
        audio.volume = clampVolume(volumeSetting);
        audio.play().catch(() => {});
      }}
      onClick={() => {
        const audio = clickAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
        audio.volume = clampVolume(volumeSetting);
        audio.play().catch(() => {});
      }}
    >
      <div className="menu-icon">
        <img src={icon} alt={label} className="menu-icon-img" />
      </div>
    </Link>
  );
};

export default MenuItem;
