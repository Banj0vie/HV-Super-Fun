import "./style.css";

import React from "react";

import { buttonFrames } from "../../../../constants/_baseimages";
import CardView from "../../CardView";

const ItemCombinationController = ({
  limitedController,
  multiplier,
  onLeftToLimited,
  onLeftOne,
  onRightOne,
  onRightToLimited,
}) => {
  return (
    <CardView className="item-combination-controller">
      {limitedController && (
        <img
          src={buttonFrames.leftTriangleButtonWithBg}
          alt="left limit"
          className="controller-button"
          onClick={() => onLeftToLimited()}
        />
      )}
      <img
        src={limitedController ? buttonFrames.leftTriangleButton : buttonFrames.leftTriangleButtonWithBg}
        alt="left"
        className="controller-button"
        onClick={() => onLeftOne()}
      />
      <div className="highlight">x{multiplier}</div>
      <img
        src={limitedController ? buttonFrames.rightTriangleButton : buttonFrames.rightTriangleButtonWithBg}
        alt="right"
        className="controller-button"
        onClick={() => onRightOne()}
      />
      {limitedController && (
        <img
          src={buttonFrames.rightTriangleButtonWithBg}
          alt="right limit"
          className="controller-button"
          onClick={() => onRightToLimited()}
        />
      )}
    </CardView>
  );
};

export default ItemCombinationController;
