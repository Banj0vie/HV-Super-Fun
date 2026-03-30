import "./style.css";

import React from "react";

import CardView from "../../../components/boxes/CardView";
import BaseButton from "../../../components/buttons/BaseButton";
import ErrorLabel from "../../../components/labels/ErrorLabel";
import { ID_CROP_CATEGORIES } from "../../../constants/app_ids";
import { SEED_PACK_STATUS, TYPE_LABEL_COLOR } from "../../../constants/item_seed";

const VendorMenu = ({
  seedStatus,
  onSeedsClicked,
  onRollChancesClicked,
  availablePlots = 0,
  hasPendingRequests = false,
  pendingRequests = [],
  onRevealClicked,
  isRevealing = false,
  isLoading = false,
  buyingItem = null,
}) => {
  const seedOrder = [
    ID_CROP_CATEGORIES.FEEBLE_SEED,
    ID_CROP_CATEGORIES.PICO_SEED,
    ID_CROP_CATEGORIES.BASIC_SEED,
    ID_CROP_CATEGORIES.PREMIUM_SEED,
  ];

  // Tier mapping to match the contract
  const tierMap = {
    [ID_CROP_CATEGORIES.FEEBLE_SEED]: 1,
    [ID_CROP_CATEGORIES.PICO_SEED]: 2,
    [ID_CROP_CATEGORIES.BASIC_SEED]: 3,
    [ID_CROP_CATEGORIES.PREMIUM_SEED]: 4,
  };
  return (
    <div className="vendor-menu">
      <div className="vendor-menu-content">
        <CardView className="available-plots min-h-0">
          Available Plots: {isLoading ? "Loading..." : availablePlots}
        </CardView>
        {seedOrder.map(id => {
          // Check if this tier has pending requests
          const tierPendingRequests = pendingRequests.filter(req => {
            const reqTier = typeof req.tier === "bigint" ? Number(req.tier) : req.tier;
            const mapTier = tierMap[id];
            return reqTier === mapTier;
          });
          const isPendingTier = tierPendingRequests.length > 0;
          const isThisTierRevealing = isPendingTier && isRevealing;
          // Check if any item from this seed pack is being bought
          const isThisSeedBuying = buyingItem && buyingItem.packId === id;

          // Calculate total count for this tier
          const totalCount = tierPendingRequests.reduce((sum, req) => sum + parseInt(req.count), 0);

          // Determine if this button should be disabled
          const isDisabled =
            seedStatus[id].status === SEED_PACK_STATUS.COMMITING ||
            (hasPendingRequests && !isPendingTier) ||
            (buyingItem !== null && !isThisSeedBuying) ||
            isRevealing; // Disable ALL buttons when any reveal is happening

          const starCount =
            id === ID_CROP_CATEGORIES.PICO_SEED
              ? 1
              : id === ID_CROP_CATEGORIES.BASIC_SEED
                ? 2
                : id === ID_CROP_CATEGORIES.PREMIUM_SEED
                  ? 3
                  : 0;

          const baseLabel = isThisSeedBuying
            ? "Buying..."
            : isThisTierRevealing
              ? "Revealing..."
              : isPendingTier
                ? `Reveal ${totalCount} ${seedStatus[id].label}`
                : seedStatus[id].status === SEED_PACK_STATUS.NORMAL
                  ? seedStatus[id].label
                  : seedStatus[id].status === SEED_PACK_STATUS.COMMITING
                    ? "Committing..."
                    : `Reveal ${seedStatus[id].count} ${seedStatus[id].label}`;

          return (
            <BaseButton
              className="vendor-button"
              labelStyle={{ color: TYPE_LABEL_COLOR[seedStatus[id].type].color }}
              label={
                <span className="vendor-button-label">
                  {starCount > 0 && (
                    <span className="vendor-button-stars">
                      {Array.from({ length: starCount }).map((_, i) => (
                        <span key={i} className="vendor-button-star">
                          ★
                        </span>
                      ))}
                    </span>
                  )}
                  <span>{baseLabel}</span>
                </span>
              }
              key={id}
              onClick={() => {
                if (isPendingTier) {
                  // Reveal the first pending request for this tier
                  const firstRequest = tierPendingRequests[0];
                  onRevealClicked(firstRequest.requestId, firstRequest.tier, firstRequest.count);
                } else {
                  onSeedsClicked(id);
                }
              }}
              disabled={isDisabled}
            />
          );
        })}
      </div>
      {/* <BaseButton
        className="vendor-button px-2rem"
        label="Roll Chances"
        onClick={() => {
          onRollChancesClicked();
        }}
        disabled={hasPendingRequests || buyingItem !== null || isRevealing}
      ></BaseButton> */}
      <ErrorLabel
        text={
          <div>
            Caution: Please reveal <br />
            within ~8 minutes!
          </div>
        }
      ></ErrorLabel>
    </div>
  );
};

export default VendorMenu;
