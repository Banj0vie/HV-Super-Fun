import "./style.css";

import React from "react";

const ItemCardList = ({ className, children }) => {
  return <div className={`item-card-list ${className}`}>{children}</div>;
};

export default ItemCardList;
