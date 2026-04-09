import React, { useState, useEffect, useRef } from "react";
import "./style.css";
import AvatarDialog from "../../../../containers/Menu_Avatar";

const Avatar = ({ src, alt = "avatar" }) => {
  const [isAvatarDialog, setIsAvatarDialog] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const clickAudioRef = useRef(null);


  const fallbackSrc = "/images/avatars/avatar-left-placeholder.png";

  useEffect(() => {
    const fetchAvatarImage = async () => {
      try {
        setLoading(true);

        // Check for selected pfp first
        const savedPfp = localStorage.getItem('sandbox_pfp');
        if (savedPfp) {
          setAvatarImage(savedPfp);
          setLoading(false);
          return;
        }

        // Fetch from local storage instead of smart contract
        const sandboxAvatars = JSON.parse(localStorage.getItem('sandbox_avatars') || '{}');
        if (sandboxAvatars[0] && sandboxAvatars[0].image) {
          setAvatarImage(sandboxAvatars[0].image);
          setLoading(false);
          return;
        }

        setAvatarImage(null);
      } catch (error) {
        console.error('Failed to fetch avatar image:', error);
        setAvatarImage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarImage();

    const handler = () => fetchAvatarImage();
    const pfpHandler = (e) => setAvatarImage(e.detail);
    window.addEventListener('avatarsUpdated', handler);
    window.addEventListener('pfpUpdated', pfpHandler);
    return () => {
      window.removeEventListener('avatarsUpdated', handler);
      window.removeEventListener('pfpUpdated', pfpHandler);
    };
  }, []);

  useEffect(() => {
    if (!clickAudioRef.current) {
      clickAudioRef.current = new Audio("/sounds/ButtonHover.wav");
      clickAudioRef.current.preload = "auto";
    }
  }, []);

  const isPfp = !!localStorage.getItem('sandbox_pfp');
  const resolvedSrc = src || avatarImage || fallbackSrc;

  return (
    <div className="avatar">
      <img src="/images/profile_bar/avatar_bg.png" alt="empty slot" className="avatar-bg"></img>
      <div className="avatar-content">
        {loading ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <img
            src={resolvedSrc}
            alt={alt}
            className="avatar-img"
            style={isPfp ? { transform: 'scale(1.4)', transformOrigin: 'center' } : undefined}
            onClick={() => {
              const audio = clickAudioRef.current;
              if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
              }
              setIsAvatarDialog(true);
            }}
            onError={(e) => {
              e.target.src = fallbackSrc;
            }}
          />
        )}
      </div>
      {isAvatarDialog && <AvatarDialog onClose={() => setIsAvatarDialog(false)}></AvatarDialog>}
    </div>
  );
};

export default Avatar;
