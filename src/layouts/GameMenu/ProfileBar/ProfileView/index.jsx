import React from "react";
import "./style.css";

const ProfileView = ({ username }) => {
  return (
    <div className="name-pill">
      <img src="/images/profile_bar/profile_bg.png" alt="name pill bg" className="name-pill-bg"></img>
      <div className="name-pill-content">
        <div>{username}</div>
      </div>
    </div>
  );
};

export default ProfileView;
