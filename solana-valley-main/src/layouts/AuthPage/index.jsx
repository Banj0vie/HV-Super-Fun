import "./style.css";

import React, { useEffect, useState } from "react";

import SocialLink from "../../components/links/SocialLink";
import { ID_AUTH_PAGES } from "../../constants/app_ids";
import { SOCIAL_LINKS } from "../../constants/app_url";
import { useAuth } from "../../context/AuthContext";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import ConnectWalletAuthBox from "./ConnectWalletAuthBox";
import ProfileAuthBox from "./ProfileAuthBox";

const AuthPage = () => {
  const { isConnected, account } = useSolanaWallet();
  const { token, profile, loading: authLoading } = useAuth();
  const [pageId, setPageId] = useState(ID_AUTH_PAGES.CONNECT_WALLET);

  useEffect(() => {
    const hasBackendProfile = !!(profile && (profile.name || profile.userName || profile.username || profile.id));

    console.log("🔍 AuthPage state:", {
      isConnected,
      hasJwt: !!token,
      hasBackendProfile,
      authLoading,
      pageId,
      account,
    });

    // Decide which page to show based on JWT and backend profile existence.
    if (!token) {
      if (pageId !== ID_AUTH_PAGES.CONNECT_WALLET) {
        console.log("🔄 Switching to CONNECT_WALLET page");
        setPageId(ID_AUTH_PAGES.CONNECT_WALLET);
      }
    } else if (token && !hasBackendProfile) {
      if (pageId !== ID_AUTH_PAGES.PROFILE) {
        console.log("🔄 Switching to PROFILE page (create profile - name missing or null)");
        setPageId(ID_AUTH_PAGES.PROFILE);
      }
    } else if (token && hasBackendProfile) {
      console.log("✅ User has JWT and backend profile with name - App will route to game", {
        account,
        profile,
      });
    }
  }, [isConnected, account, token, profile, authLoading, pageId]);

  const onCreateProfile = (username, referralCode) => {
    console.log("Created Profile!", username, referralCode);
    // Force a small delay to ensure state has updated
    setTimeout(() => {
      console.log("🔄 AuthPage: Checking state after profile creation...");
    }, 1000);
  };
  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-wrapper">
        <img className="modal-header-bg" src="/images/dialog/top-back.png" alt="background" />
        <div className="auth-box">
          <img className="modal-left-top-image" src="/images/dialog/left-top.png" alt="left-top-image" />
          <img className="modal-bottom-center-image" src="/images/dialog/bottom-center.png" alt="bottom-center-image" />
          <img
            className="modal-bottom-center-emerald"
            src="/images/dialog/bottom-center-emerald.png"
            alt="bottom-center-emerald-image"
          />
          <div className="auth-box-content">
            <div className="modal-header">
              <img className="modal-header-image" src="/images/dialog/top-baseheader.png" alt="header" />
              <img
                className="modal-header-additional-image"
                src="/images/dialog/modal-header-wallet.png"
                alt="additional header"
              />
              <img className="modal-header-label-scroll" src="/images/dialog/label-scroll.png" alt="header" />
              <span className="modal-header-title">
                {pageId === ID_AUTH_PAGES.CONNECT_WALLET ? "WALLET" : "PROFILE"}
              </span>
            </div>
            <div className="auth-box-logo">
              <img className="auth-box-logo-bg" src="/images/profile_bar/avatar_bg.png" alt="logo background"></img>
              <img className="auth-box-logo-image" src="/images/avatars/avatar-left-placeholder.png" alt="logo"></img>
            </div>
            {pageId === ID_AUTH_PAGES.CONNECT_WALLET && <ConnectWalletAuthBox></ConnectWalletAuthBox>}
            {pageId === ID_AUTH_PAGES.PROFILE && <ProfileAuthBox onCreateProfile={onCreateProfile}></ProfileAuthBox>}
          </div>
          <div className="auth-box-content-background"></div>
          <div className="auth-box-footer">
            {SOCIAL_LINKS.map((item, index) => (
              <SocialLink data={item} key={index}></SocialLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
