import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getLeaderboardByEpoch, getLeaderboardCurrent } from "../api/leaderboardApi";
import { getProfile } from "../api/profileApi";
import {
  fetchLeaderboardFailure,
  fetchLeaderboardStart,
  fetchLeaderboardSuccess,
  selectLeaderboardCurrentEpoch,
  selectLeaderboardEpochStart,
  selectLeaderboardItems,
  selectLeaderboardLoading,
  selectLeaderboardSelectedEpoch,
  selectLeaderboardUserScore,
  setSelectedEpoch,
} from "../solana/store/slices/leaderboardSlice";
import { EPOCH_PERIOD } from "../utils/basic";
import { useSolanaWallet } from "./useSolanaWallet";

export const useLeaderboard = () => {
  const { account } = useSolanaWallet();
  const dispatch = useDispatch();

  const leaderboardData = useSelector(selectLeaderboardItems);
  const userScore = useSelector(selectLeaderboardUserScore);
  const currentEpoch = useSelector(selectLeaderboardCurrentEpoch);
  const epochStart = useSelector(selectLeaderboardEpochStart);
  const selectedEpoch = useSelector(selectLeaderboardSelectedEpoch);
  const loading = useSelector(selectLeaderboardLoading);

  const mapTop5ToItems = useCallback(top5 => {
    return (Array.isArray(top5) ? top5 : []).map((row, i) => ({
      rank: i + 1,
      name: row?.name ?? "Anonymous",
      score: Number(row?.xp ?? 0),
    }));
  }, []);

  const fetchUserScore = useCallback(async () => {
    if (!account) return 0;
    const profile = await getProfile(account);
    if (!profile) return 0;
    const ud = profile.userData || profile;
    const myScore = Number(ud?.epochXp ?? ud?.epoch_xp ?? 0);
    return Number.isFinite(myScore) ? myScore : 0;
  }, [account]);

  const fetchLeaderboardData = useCallback(
    async epochParam => {
      dispatch(fetchLeaderboardStart());
      try {
        const nowSec = Math.floor(Date.now() / 1000);
        const epochStart = nowSec - (nowSec % EPOCH_PERIOD);
        const currentResp = await getLeaderboardCurrent();
        const currentEpochFromBackend = Number(currentResp?.epoch ?? 0);
        const requestedEpoch =
          epochParam === undefined || epochParam === null ? currentEpochFromBackend : Number(epochParam);
        const epochResp =
          requestedEpoch === currentEpochFromBackend ? currentResp : await getLeaderboardByEpoch(requestedEpoch);
        const resolvedEpoch = Number(epochResp?.epoch ?? requestedEpoch);
        const items = mapTop5ToItems(epochResp?.top5);
        const myScore = await fetchUserScore();

        dispatch(
          fetchLeaderboardSuccess({
            items,
            userScore: myScore,
            currentEpoch: currentEpochFromBackend,
            epochStart,
            selectedEpoch: resolvedEpoch,
          })
        );
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to load leaderboard";
        dispatch(fetchLeaderboardFailure(message));
      }
    },
    [dispatch, fetchUserScore, mapTop5ToItems]
  );

  const changeEpoch = useCallback(
    async epoch => {
      dispatch(setSelectedEpoch(epoch));
      await fetchLeaderboardData(epoch);
    },
    [dispatch, fetchLeaderboardData]
  );

  return {
    leaderboardData,
    userScore,
    epochStart,
    currentEpoch,
    selectedEpoch,
    loading,
    fetchLeaderboardData,
    changeEpoch,
  };
};
