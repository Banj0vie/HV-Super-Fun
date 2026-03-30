import "./style.css";

import React, { useState } from "react";

import BaseButton from "../../../components/buttons/BaseButton";
import BaseInput from "../../../components/inputs/BaseInput";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";

const ProfileAuthBox = ({ onCreateProfile }) => {
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const { show } = useNotification();
  const { createProfile } = useAuth();

  const handleCreateProfile = async () => {
    const usernameTrimmed = String(username ?? "").trim();
    if (!usernameTrimmed) {
      show("Please enter a username", "warning");
      return;
    }

    console.log("🚀 Creating profile via backend:", {
      username: usernameTrimmed,
      referralCode: String(referralCode ?? "").trim(),
    });
    setIsCreatingProfile(true);
    try {
      const createdProfile = await createProfile({
        userName: usernameTrimmed,
        referralCode: String(referralCode ?? "").trim(),
      });
      console.log("✅ Profile created via backend:", createdProfile);

      onCreateProfile(usernameTrimmed, String(referralCode ?? "").trim());
      show("Profile created successfully!", "success");

      // Refresh the current page after successful profile creation
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Failed to create profile:", err);
      show(`Failed to create profile: ${err.message}`, "error");
    } finally {
      setIsCreatingProfile(false);
    }
  };

  return (
    <div className="profile-auth-box">
      <div className="profile-label">Create your Profile!</div>
      <BaseInput
        className="h-2.5rem w-75"
        type="text"
        placeholder="Username (Max 32)"
        setValue={un => setUsername(un)}
        value={username}
      ></BaseInput>
      <BaseInput
        className="h-2.5rem w-75"
        type="text"
        placeholder="Referral Code (Optional)"
        setValue={rc => setReferralCode(rc)}
        value={referralCode}
      ></BaseInput>
      <BaseButton
        className="h-3rem w-75"
        label={isCreatingProfile ? "Creating Profile..." : "Create Profile"}
        onClick={handleCreateProfile}
        disabled={isCreatingProfile}
      ></BaseButton>
    </div>
  );
};

export default ProfileAuthBox;
