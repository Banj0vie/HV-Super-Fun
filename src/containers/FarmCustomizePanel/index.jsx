import React, { useState, useEffect } from "react";
import "./style.css";

const PLACEABLE_ITEMS = [
  { id: "scarecrow",     name: "Scarecrow",         emoji: "🪶",  desc: "Boosts all crop yields by 2%",            tag: "STATUE"  },
  { id: "night_watch",   name: "Night Watcher",      emoji: "🕯️",  desc: "Guards crops from wilting overnight",     tag: "STATUE"  },
  { id: "rain_barrel",   name: "Rain Barrel",        emoji: "🪣",  desc: "Crops stay hydrated one extra day",       tag: "STATUE"  },
  { id: "compost_bin",   name: "Compost Bin",        emoji: "♻️",  desc: "Passively generates fertilizer each day", tag: "STATUE"  },
  { id: "lucky_shoe",    name: "Lucky Horseshoe",    emoji: "🧲",  desc: "2% chance to double any harvest",         tag: "STATUE"  },
  { id: "stone_idol",    name: "Stone Idol",         emoji: "🗿",  desc: "All crop sales earn 3% bonus gold",       tag: "STATUE"  },
  { id: "barn_owl",      name: "Barn Owl",           emoji: "🦉",  desc: "Boosts fishing XP earned by 5%",          tag: "STATUE"  },
  { id: "tower_potato",  name: "Potato Tower",       emoji: "🥔",  desc: "Grows potatoes 5% faster",               tag: "TOWER"   },
  { id: "tower_carrot",  name: "Carrot Tower",       emoji: "🥕",  desc: "Grows carrots 5% faster",                tag: "TOWER"   },
  { id: "tower_tomato",  name: "Tomato Tower",       emoji: "🍅",  desc: "Grows tomatoes 5% faster",               tag: "TOWER"   },
  { id: "tower_corn",    name: "Corn Tower",         emoji: "🌽",  desc: "Grows corn 5% faster",                   tag: "TOWER"   },
];

const SOIL_THEMES = [
  // ── Default ──────────────────────────────────────────────────────────────
  {
    id: "soil_default",
    name: "Classic Soil",
    emoji: "🟫",
    desc: "The trusty brown soil every farmer starts with.",
    color: "#8B5E3C",
    unlockType: "always",
    unlockLabel: "Default",
  },
  // ── ROYGBIV ──────────────────────────────────────────────────────────────
  {
    id: "soil_red",
    name: "Red Soil",
    emoji: "🔴",
    desc: "Rich with iron. Harvest 10 crops to unlock.",
    color: "#C0392B",
    unlockType: "total_crops",
    threshold: 10,
    unlockLabel: "10 crops",
  },
  {
    id: "soil_orange",
    name: "Orange Soil",
    emoji: "🟠",
    desc: "Warm and volcanic. Harvest 25 crops to unlock.",
    color: "#E67E22",
    unlockType: "total_crops",
    threshold: 25,
    unlockLabel: "25 crops",
  },
  {
    id: "soil_yellow",
    name: "Yellow Soil",
    emoji: "🟡",
    desc: "Sun-baked and bright. Harvest 50 crops to unlock.",
    color: "#F1C40F",
    unlockType: "total_crops",
    threshold: 50,
    unlockLabel: "50 crops",
  },
  {
    id: "soil_green",
    name: "Green Soil",
    emoji: "🟢",
    desc: "Mossy and lush. Harvest 100 crops to unlock.",
    color: "#27AE60",
    unlockType: "total_crops",
    threshold: 100,
    unlockLabel: "100 crops",
  },
  {
    id: "soil_blue",
    name: "Blue Soil",
    emoji: "🔵",
    desc: "Cool and mineral-rich. Harvest 200 crops to unlock.",
    color: "#2980B9",
    unlockType: "total_crops",
    threshold: 200,
    unlockLabel: "200 crops",
  },
  {
    id: "soil_purple",
    name: "Purple Soil",
    emoji: "🟣",
    desc: "Deep and mysterious. Harvest 350 crops to unlock.",
    color: "#8E44AD",
    unlockType: "total_crops",
    threshold: 350,
    unlockLabel: "350 crops",
  },
  // ── Prestige Grind ────────────────────────────────────────────────────────
  {
    id: "soil_silver",
    name: "Silver Soil",
    emoji: "🩶",
    desc: "Enriched with minerals. Requires 2,000 crops.",
    color: "#A8B8C8",
    unlockType: "total_crops",
    threshold: 2000,
    unlockLabel: "2,000 crops",
  },
  {
    id: "soil_gold",
    name: "Gold Soil",
    emoji: "✨",
    desc: "Gleaming with riches. Requires 7,500 crops.",
    color: "#D4A017",
    unlockType: "total_crops",
    threshold: 7500,
    unlockLabel: "7,500 crops",
  },
  {
    id: "soil_cosmic",
    name: "Cosmic Soil",
    emoji: "🌌",
    desc: "Infused with stardust from beyond. Requires 25,000 crops.",
    color: "#7C3AED",
    unlockType: "total_crops",
    threshold: 25000,
    unlockLabel: "25,000 crops",
  },
  {
    id: "soil_diamond",
    name: "Diamond Soil",
    emoji: "💎",
    desc: "Crystallised perfection. Requires 100,000 crops.",
    color: "#B9F2FF",
    unlockType: "total_crops",
    threshold: 100000,
    unlockLabel: "100,000 crops",
  },
  {
    id: "soil_dragon",
    name: "Dragon Soil",
    emoji: "🐉",
    desc: "Born of fire and fruit. Harvest 100 Dragonfruits to unlock.",
    color: "#FF4500",
    unlockType: "dragonfruit",
    threshold: 100,
    unlockLabel: "100 Dragonfruits",
  },
];

const TABS = ["Placeables", "Cosmetics"];

const COSMETIC_CATEGORIES = [
  { id: "soil", label: "Soil", emoji: "🌱", desc: "Change the color of your farm soil." },
];

const FarmCustomizePanel = ({ onClose }) => {
  const [tab, setTab] = useState(0);
  const [cosmeticView, setCosmeticView] = useState(null); // null = category list, 'soil' = soil picker
  const [owned, setOwned] = useState({});
  const [active, setActive] = useState({});
  const [feedback, setFeedback] = useState({});
  const [totalCrops, setTotalCrops] = useState(0);
  const [dragonfruitHarvested, setDragonfruitHarvested] = useState(0);
  const [activeSoil, setActiveSoil] = useState('soil_default');

  const loadProgress = () => {
    setTotalCrops(parseInt(localStorage.getItem('sandbox_total_crops') || '0', 10));
    setDragonfruitHarvested(parseInt(localStorage.getItem('sandbox_dragonfruit_harvested') || '0', 10));
    setActiveSoil(localStorage.getItem('sandbox_active_soil') || 'soil_default');
  };

  useEffect(() => {
    loadProgress();
    const ownedMap = {};
    const activeMap = {};
    for (const item of PLACEABLE_ITEMS) {
      ownedMap[item.id] = localStorage.getItem(`sandbox_owned_${item.id}`) === 'true';
      activeMap[item.id] = localStorage.getItem(`sandbox_active_${item.id}`) === 'true';
    }
    setOwned(ownedMap);
    setActive(activeMap);

    const handler = () => loadProgress();
    window.addEventListener('soilProgressChanged', handler);
    return () => window.removeEventListener('soilProgressChanged', handler);
  }, []);

  const toggleActive = (itemId) => {
    if (!owned[itemId]) {
      setFeedback(f => ({ ...f, [itemId]: 'Visit the Shop to unlock!' }));
      setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[itemId]; return n; }), 2000);
      return;
    }
    const next = !active[itemId];
    setActive(a => ({ ...a, [itemId]: next }));
    localStorage.setItem(`sandbox_active_${itemId}`, next ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('sandboxStatueChanged', { detail: itemId }));
  };

  const isUnlocked = (soil) => {
    if (soil.unlockType === 'always') return true;
    if (soil.unlockType === 'total_crops') return totalCrops >= soil.threshold;
    if (soil.unlockType === 'dragonfruit') return dragonfruitHarvested >= soil.threshold;
    return false;
  };

  const getProgress = (soil) => {
    if (soil.unlockType === 'total_crops') return { current: totalCrops, max: soil.threshold };
    if (soil.unlockType === 'dragonfruit') return { current: dragonfruitHarvested, max: soil.threshold };
    return null;
  };

  const selectSoil = (soil) => {
    if (!isUnlocked(soil)) return;
    setActiveSoil(soil.id);
    localStorage.setItem('sandbox_active_soil', soil.id);
    // null color for default (no tint), real color for everything else
    const color = soil.unlockType === 'always' ? null : soil.color;
    if (color) localStorage.setItem('sandbox_active_soil_color', color);
    else localStorage.removeItem('sandbox_active_soil_color');
    window.dispatchEvent(new CustomEvent('farmSoilChanged', { detail: soil.id }));
  };

  return (
    <div className="fc-overlay" onClick={onClose}>
      <div className="fc-panel" onClick={e => e.stopPropagation()}>

        <div className="fc-header">
          <span className="fc-title">Farm</span>
          <button className="fc-close" onClick={onClose}>✕</button>
        </div>

        <div className="fc-tabs">
          {TABS.map((t, i) => (
            <button key={i} className={`fc-tab ${tab === i ? 'active' : ''}`} onClick={() => { setTab(i); setCosmeticView(null); }}>
              {i === 0 ? '🪶' : '🎨'} {t}
            </button>
          ))}
        </div>

        {/* ── Placeables ── */}
        {tab === 0 && (
          <>
            <div className="fc-grid">
              {PLACEABLE_ITEMS.map(item => {
                const isOwned = owned[item.id];
                const isActive = active[item.id];
                const fb = feedback[item.id];
                return (
                  <div
                    key={item.id}
                    className={`fc-item ${isActive ? 'fc-item-active' : ''} ${!isOwned ? 'fc-item-locked' : ''}`}
                    onClick={() => toggleActive(item.id)}
                  >
                    <div className="fc-item-tag">{item.tag}</div>
                    <div className="fc-item-emoji">{item.emoji}</div>
                    <div className="fc-item-name">{item.name}</div>
                    <div className="fc-item-desc">{item.desc}</div>
                    {fb && <div className="fc-item-fb">{fb}</div>}
                    {!isOwned && <div className="fc-item-lock">🔒 Buy in Shop</div>}
                    {isOwned && (
                      <div className={`fc-item-status ${isActive ? 'on' : 'off'}`}>
                        {isActive ? '● Placed' : '○ Not placed'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="fc-footer">Buy items in the <strong>Shop</strong> to unlock placeables.</div>
          </>
        )}

        {/* ── Cosmetics ── */}
        {tab === 1 && cosmeticView === null && (
          <div className="fc-category-list">
            {COSMETIC_CATEGORIES.map(cat => (
              <div key={cat.id} className="fc-category-row" onClick={() => setCosmeticView(cat.id)}>
                <span className="fc-category-emoji">{cat.emoji}</span>
                <div className="fc-category-text">
                  <div className="fc-category-label">{cat.label}</div>
                  <div className="fc-category-desc">{cat.desc}</div>
                </div>
                <span className="fc-category-arrow">›</span>
              </div>
            ))}
          </div>
        )}

        {tab === 1 && cosmeticView === 'soil' && (
          <>
            <button className="fc-back" onClick={() => setCosmeticView(null)}>‹ Back</button>
            <div className="fc-soil-grid">
              {SOIL_THEMES.map(soil => {
                const unlocked = isUnlocked(soil);
                const isActive = activeSoil === soil.id;
                const prog = getProgress(soil);
                const pct = prog ? Math.min(100, Math.floor((prog.current / prog.max) * 100)) : 100;
                return (
                  <div
                    key={soil.id}
                    className={`fc-soil ${isActive ? 'fc-soil-active' : ''} ${!unlocked ? 'fc-soil-locked' : ''}`}
                    style={isActive ? { borderColor: soil.color, boxShadow: `0 0 16px ${soil.color}55` } : {}}
                    onClick={() => selectSoil(soil)}
                  >
                    <div className="fc-soil-swatch" style={{ background: soil.color }} />
                    <div className="fc-soil-emoji">{soil.emoji}</div>
                    <div className="fc-soil-name" style={isActive ? { color: soil.color } : {}}>{soil.name}</div>
                    <div className="fc-soil-desc">{soil.desc}</div>
                    {!unlocked && prog && (
                      <>
                        <div className="fc-soil-bar-bg">
                          <div className="fc-soil-bar-fill" style={{ width: `${pct}%`, background: soil.color }} />
                        </div>
                        <div className="fc-soil-progress">
                          {prog.current.toLocaleString()} / {prog.max.toLocaleString()} {soil.unlockLabel.split(' ').slice(1).join(' ')}
                        </div>
                      </>
                    )}
                    {unlocked && isActive && <div className="fc-soil-badge active">✓ Active</div>}
                    {unlocked && !isActive && <div className="fc-soil-badge">Tap to equip</div>}
                    {!unlocked && <div className="fc-soil-badge locked">🔒 {soil.unlockLabel}</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default FarmCustomizePanel;
