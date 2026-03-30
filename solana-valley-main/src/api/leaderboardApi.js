import httpClient from "./httpClient";

export const getLeaderboardCurrent = async () => {
  const response = await httpClient.get("/read/leaderboard/current");
  return response.data;
};

export const getLeaderboardByEpoch = async epoch => {
  const response = await httpClient.get(`/read/leaderboard/${epoch}`);
  return response.data;
};

export const leaderboardApi = {
  getLeaderboardCurrent,
  getLeaderboardByEpoch,
};

export default leaderboardApi;
