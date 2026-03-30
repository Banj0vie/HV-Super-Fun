import { useCallback, useEffect, useState } from "react";

import { getToken } from "../api/httpClient";
import { getProfile } from "../api/profileApi";
import { addReferral } from "../api/referralApi";
import { useAuth } from "../context/AuthContext";
import { useSolanaWallet } from "./useSolanaWallet";

export const useReferral = () => {
  const { account } = useSolanaWallet();
  const { loginWithWallet } = useAuth();
  const [referralData, setReferralData] = useState({
    myReferralCode: null,
    sponsor: null,
    canRegisterCode: false,
    referralBpsByLevel: {},
    currentLevel: 0,
    loading: false,
    error: null,
  });

  const fetchReferralData = useCallback(async () => {
    if (!account) return;
    setReferralData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await getProfile(account);
      const currentLevel = Number(profile?.level ?? profile?.userData?.level ?? 0);
      const sponsor = profile?.sponsorWallet ?? profile?.userData?.sponsorWallet ?? null;

      // Backend stores referralCode either as null or a string-ish value.
      // Normalize to a plain string for UI.
      const rawCode = profile?.referralCode ?? profile?.userData?.referralCode ?? null;
      const myReferralCode =
        rawCode && typeof rawCode === "string" && rawCode.trim().length > 0 ? rawCode.trim() : null;

      const canRegisterCode = currentLevel >= 6 && !myReferralCode;
      const referralBps = {};
      for (let level = 0; level <= 15; level++) referralBps[level] = 500;
      setReferralData({
        myReferralCode,
        sponsor,
        canRegisterCode,
        referralBpsByLevel: referralBps,
        currentLevel,
        loading: false,
        error: null,
      });
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to fetch referral data";
      setReferralData(prev => ({ ...prev, loading: false, error: message }));
    }
  }, [account]);

  const registerReferralCode = useCallback(
    async code => {
      if (!account) {
        setReferralData(p => ({ ...p, error: "Wallet not connected" }));
        return null;
      }
      setReferralData(p => ({ ...p, loading: true, error: null }));
      try {
        // Ensure we have a JWT for this protected endpoint.
        if (!getToken(account)) {
          await loginWithWallet(account);
        }

        const tx = await addReferral({ wallet: account, code });
        await fetchReferralData();
        return tx;
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to register referral code";
        setReferralData(p => ({ ...p, loading: false, error: message }));
        throw new Error(message);
      }
    },
    [account, fetchReferralData, loginWithWallet]
  );

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  return { ...referralData, registerReferralCode, fetchReferralData };
};
