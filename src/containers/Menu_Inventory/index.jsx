import React, { useEffect, useState } from "react";
import "./style.css";
import BaseDialog from "../_BaseDialog";
import {
  ID_CHEST_ITEMS,
  ID_INVENTORY_MENUS,
  ID_LOOTS,
  ID_PRODUCE_ITEMS,
  ID_SEEDS,
} from "../../constants/app_ids";
import BaseButton from "../../components/buttons/BaseButton";
import ItemSmallView from "../../components/boxes/ItemViewSmall";
import ItemViewUsable from "../../components/boxes/ItemViewUsable";

const menus = [
  { id: ID_INVENTORY_MENUS.SEEDS, label: "Seeds" },
  { id: ID_INVENTORY_MENUS.PRODUCE, label: "Produce" },
  { id: ID_INVENTORY_MENUS.FISHES, label: "Fishes" },
  { id: ID_INVENTORY_MENUS.ITEMS, label: "Items" },
];

const TESTING_SEEDS = [
  {
    id: ID_SEEDS.F_POTATO,
    count: 2,
  },
  {
    id: ID_SEEDS.F_CABBAGE,
    count: 2,
  },
  {
    id: ID_SEEDS.F_LETTUCE,
    count: 3,
  },
  {
    id: ID_SEEDS.F_ONION,
    count: 1,
  },
  {
    id: ID_SEEDS.F_POTATO,
    count: 2,
  },
  {
    id: ID_SEEDS.F_RADISH,
    count: 2,
  },
];

const TESTIING_PRODUCE = [
  {
    id: ID_PRODUCE_ITEMS.BANANA,
    count: 2,
  },
  {
    id: ID_PRODUCE_ITEMS.ARTICHOKE,
    count: 4,
  },
  {
    id: ID_PRODUCE_ITEMS.AVOCADO,
    count: 1,
  },
  {
    id: ID_PRODUCE_ITEMS.BERRY,
    count: 5,
  },
  {
    id: ID_PRODUCE_ITEMS.BLUEBERRY,
    count: 6,
  },
  {
    id: ID_PRODUCE_ITEMS.BROCCOLI,
    count: 7,
  },
  {
    id: ID_PRODUCE_ITEMS.CABBAGE,
    count: 8,
  },
  {
    id: ID_PRODUCE_ITEMS.CARROT,
    count: 9,
  },
  {
    id: ID_PRODUCE_ITEMS.CAULIFLOWER,
    count: 1,
  },
  {
    id: ID_PRODUCE_ITEMS.CAULIFLOWER,
    count: 5,
  },
  {
    id: ID_PRODUCE_ITEMS.CELERY,
    count: 4,
  },
  {
    id: ID_PRODUCE_ITEMS.CHILI,
    count: 4,
  },
  {
    id: ID_PRODUCE_ITEMS.CORN,
    count: 8,
  },
  {
    id: ID_PRODUCE_ITEMS.DRAGONFRUIT,
    count: 5,
  },
  {
    id: ID_PRODUCE_ITEMS.FIG,
    count: 2,
  },
  {
    id: ID_PRODUCE_ITEMS.GRAPES,
    count: 5,
  },
  {
    id: ID_PRODUCE_ITEMS.LAVENDER,
    count: 6,
  },
  {
    id: ID_PRODUCE_ITEMS.LETTUCE,
    count: 8,
  },
  {
    id: ID_PRODUCE_ITEMS.MANGO,
    count: 5,
  },
];

const TESTING_FISHES = [
  {
    id: ID_LOOTS.CATFISH,
    count: 1,
  },
  {
    id: ID_LOOTS.CATFISH,
    count: 3,
  },
  {
    id: ID_LOOTS.CATFISH,
    count: 6,
  },
  {
    id: ID_LOOTS.CATFISH,
    count: 2,
  },
  {
    id: ID_LOOTS.CATFISH,
    count: 3,
  },
];

const TESTING_ITEMS = [
  {
    id: ID_CHEST_ITEMS.CHEST_SILVER,
    count: 2,
    usable: false,
  },
  {
    id: ID_CHEST_ITEMS.CHEST_GOLD,
    count: 3,
    usable: true,
  },
];

const InventoryDialog = ({ onClose }) => {
  const [selectedMenu, setSelectedMenu] = useState(ID_INVENTORY_MENUS.SEEDS);
  const [list, setList] = useState([]);

  const onUseItem = (itemId) => {
    console.log("itemId", itemId);
  };

  useEffect(() => {
    switch (selectedMenu) {
      case ID_INVENTORY_MENUS.SEEDS:
        setList(TESTING_SEEDS);
        break;
      case ID_INVENTORY_MENUS.PRODUCE:
        setList(TESTIING_PRODUCE);
        break;
      case ID_INVENTORY_MENUS.FISHES:
        setList(TESTING_FISHES);
        break;
      case ID_INVENTORY_MENUS.ITEMS:
        setList(TESTING_ITEMS);
        break;
      default:
        break;
    }
  }, [selectedMenu]);

  return (
    <BaseDialog onClose={onClose} title="INVENTORY">
      <div className="inventory-dialog">
        <div className="layout">
          <div className="info-row">
            {menus.map((item, index) => (
              <BaseButton
                className={`button ${index === 0 ? "first" : ""}`}
                label={item.label}
                key={index}
                focused={selectedMenu === item.id}
                onClick={() => setSelectedMenu(item.id)}
              ></BaseButton>
            ))}
          </div>
          <div className="seed-row">
            {selectedMenu !== ID_INVENTORY_MENUS.ITEMS && (
              <div className="seed-row-wrapper">
                {list.map((item, index) => (
                  <ItemSmallView
                    key={index}
                    itemId={item.id}
                    count={item.count}
                  ></ItemSmallView>
                ))}
              </div>
            )}
            {selectedMenu === ID_INVENTORY_MENUS.ITEMS && (
              <div className="seed-list">
                {list.map((item, index) => (
                  <ItemViewUsable
                    key={index}
                    itemId={item.id}
                    count={item.count}
                    onUse={onUseItem}
                    usable={item.usable}
                  ></ItemViewUsable>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default InventoryDialog;
