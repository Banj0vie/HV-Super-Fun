import React, { useState, useEffect, useCallback } from "react";
import "./style.css";
import CardListView from "../../../components/boxes/CardListView";
import BaseDivider from "../../../components/dividers/BaseDivider";
import Slider from "../../../components/inputs/Slider";
import BaseButton from "../../../components/buttons/BaseButton";
import { useContracts, useROIData } from "../../../hooks/useContracts";
import { useWeb3 } from "../../../contexts/Web3Context";

const RollChances = ({ onBack }) => {
  const { contracts } = useContracts();
  const { account } = useWeb3();
  const { roiData, getROIData, loading } = useROIData(contracts);
  const [currentFarmLevel, setCurrentFarmLevel] = useState(0);

  // Get user's farm level from PlayerStore
  const getUserFarmLevel = useCallback(async () => {
    if (!contracts || !contracts.player_store || !account) return 0;
    
    try {
      const profile = await contracts.player_store.profileOf(account);
      return Number(profile[1]) || 0; // level is the second element
    } catch (err) {
      console.error('Failed to get farm level:', err);
      return 0;
    }
  }, [contracts, account]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const level = await getUserFarmLevel();
      setCurrentFarmLevel(level);
      await getROIData(level);
    };
    
    if (contracts && account) {
      loadData();
    }
  }, [contracts, account, getUserFarmLevel, getROIData]);

  // Update ROI data when farm level changes
  const handleFarmLevelChange = async (newLevel) => {
    setCurrentFarmLevel(newLevel);
    await getROIData(newLevel);
  };

  const primaryData = [
    { label: "Commons", value: `${roiData.commons.toFixed(2)}%` },
    { label: "Uncommons", value: `${roiData.uncommons.toFixed(2)}%` },
    { label: "Rares", value: `${roiData.rares.toFixed(2)}%` },
    { label: "Epics", value: `${roiData.epics.toFixed(2)}%` },
    { label: "Legendaries", value: `${roiData.legendaries.toFixed(2)}%` },
  ];

  return (
    <div className="roll-chances-wrapper">
      <div className="unlocked-roi">
        <p>Unlocked ROI</p>
      </div>
      <CardListView data={primaryData}></CardListView>
      <BaseDivider />
      <div className="slider-wrapper">
        <div className="w-full text-center">
          Farm Level: {loading ? "Loading..." : currentFarmLevel}
        </div>
        <Slider
          min="0"
          max="15"
          step="1"
          value={currentFarmLevel}
          setValue={handleFarmLevelChange}
          disabled={loading}
        ></Slider>
      </div>
      <BaseButton className="h-4rem" label="Back" onClick={onBack}></BaseButton>
    </div>
  );
};

export default RollChances;