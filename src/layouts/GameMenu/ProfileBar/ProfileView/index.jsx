import React, { useState, useEffect } from "react";
import "./style.css";

const ProfileView = ({ username }) => {
  const [bannerImg, setBannerImg] = useState(() => localStorage.getItem('sandbox_profile_banner_img') || null);

  useEffect(() => {
    const handler = (e) => setBannerImg(e.detail || null);
    window.addEventListener('profileBannerUpdated', handler);
    return () => window.removeEventListener('profileBannerUpdated', handler);
  }, []);

  const savedBgId = localStorage.getItem('sandbox_profile_bg') || 'bg_default';
  const isHoneyDrip = savedBgId === 'bg_honeydrop';

  return (
    <div className="name-pill">
      <img src={bannerImg || '/images/profile_bar/profile_bg.png'} alt="name pill bg" className="name-pill-bg" />
      {isHoneyDrip && (
        <img src="/images/banner/hdripextentsion.png" alt="" style={{ position: 'absolute', bottom: '-23px', left: '-4.5%', width: '109%', pointerEvents: 'none', zIndex: 10 }} />
      )}
      <div className="name-pill-content">
        <div>{username}</div>
      </div>
    </div>
  );
};

export default ProfileView;
