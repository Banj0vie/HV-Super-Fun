import React, { useState, useEffect, useCallback, useRef } from "react";
import "./style.css";
import BaseButton from "../../components/buttons/BaseButton";
import { ID_PRODUCE_ITEMS, ID_FISH_ITEMS } from "../../constants/app_ids";

const SKIP_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

const MISSION_POOL = [
  { id: "turnin_carrot_2",    title: "Carrot Delivery",    desc: "Turn in 2 Carrots.",        itemId: ID_PRODUCE_ITEMS.CARROT,      amount: 2,  reward: 25,   rewardLabel: "25 Honey",  type: "vegetable" },
  { id: "turnin_potato_2",    title: "Potato Supply",      desc: "Turn in 2 Potatoes.",       itemId: ID_PRODUCE_ITEMS.POTATO,      amount: 2,  reward: 25,   rewardLabel: "25 Honey",  type: "vegetable" },
  { id: "turnin_tomato_2",    title: "Tomato Haul",        desc: "Turn in 2 Tomatoes.",       itemId: ID_PRODUCE_ITEMS.TOMATO,      amount: 2,  reward: 30,   rewardLabel: "30 Honey",  type: "vegetable" },
  { id: "turnin_corn_2",      title: "Corn Run",           desc: "Turn in 2 Corn.",           itemId: ID_PRODUCE_ITEMS.CORN,        amount: 2,  reward: 30,   rewardLabel: "30 Honey",  type: "vegetable" },
  { id: "turnin_pumpkin_1",   title: "Pumpkin Patch",      desc: "Turn in 1 Pumpkin.",        itemId: ID_PRODUCE_ITEMS.PUMPKIN,     amount: 1,  reward: 35,   rewardLabel: "35 Honey",  type: "vegetable" },
  { id: "turnin_lettuce_3",   title: "Lettuce Load",       desc: "Turn in 3 Lettuce.",        itemId: ID_PRODUCE_ITEMS.LETTUCE,     amount: 3,  reward: 30,   rewardLabel: "30 Honey",  type: "vegetable" },
  { id: "turnin_pepper_2",    title: "Spice Trade",        desc: "Turn in 2 Peppers.",        itemId: ID_PRODUCE_ITEMS.PEPPER,      amount: 2,  reward: 30,   rewardLabel: "30 Honey",  type: "vegetable" },
  { id: "turnin_broccoli_2",  title: "Broccoli Batch",     desc: "Turn in 2 Broccoli.",       itemId: ID_PRODUCE_ITEMS.BROCCOLI,    amount: 2,  reward: 30,   rewardLabel: "30 Honey",  type: "vegetable" },
  { id: "turnin_wheat_3",     title: "Wheat Harvest",      desc: "Turn in 3 Wheat.",          itemId: ID_PRODUCE_ITEMS.WHEAT,       amount: 3,  reward: 30,   rewardLabel: "30 Honey",  type: "vegetable" },
  { id: "turnin_onion_2",     title: "Onion Order",        desc: "Turn in 2 Onions.",         itemId: ID_PRODUCE_ITEMS.ONION,       amount: 2,  reward: 28,   rewardLabel: "28 Honey",  type: "vegetable" },
  { id: "turnin_celery_2",    title: "Celery Stash",       desc: "Turn in 2 Celery.",         itemId: ID_PRODUCE_ITEMS.CELERY,      amount: 2,  reward: 28,   rewardLabel: "28 Honey",  type: "vegetable" },
  { id: "turnin_grapes_1",    title: "Grape Bunch",        desc: "Turn in 1 Grapes.",         itemId: ID_PRODUCE_ITEMS.GRAPES,      amount: 1,  reward: 35,   rewardLabel: "35 Honey",  type: "vegetable" },
  { id: "turnin_anchovy_2",   title: "Anchovy Catch",      desc: "Turn in 2 Anchovies.",      itemId: ID_FISH_ITEMS.ANCHOVY,        amount: 2,  reward: 30,   rewardLabel: "30 Honey",  type: "fish" },
  { id: "turnin_sardine_2",   title: "Sardine Haul",       desc: "Turn in 2 Sardines.",       itemId: ID_FISH_ITEMS.SARDINE,        amount: 2,  reward: 30,   rewardLabel: "30 Honey",  type: "fish" },
  { id: "turnin_herring_2",   title: "Herring Run",        desc: "Turn in 2 Herring.",        itemId: ID_FISH_ITEMS.HERRING,        amount: 2,  reward: 35,   rewardLabel: "35 Honey",  type: "fish" },
  { id: "turnin_trout_1",     title: "Trout Trade",        desc: "Turn in 1 Small Trout.",    itemId: ID_FISH_ITEMS.SMALL_TROUT,    amount: 1,  reward: 40,   rewardLabel: "40 Honey",  type: "fish" },
  { id: "turnin_perch_1",     title: "Perch Platter",      desc: "Turn in 1 Yellow Perch.",   itemId: ID_FISH_ITEMS.YELLOW_PERCH,   amount: 1,  reward: 45,   rewardLabel: "45 Honey",  type: "fish" },
  { id: "turnin_salmon_1",    title: "Salmon Supply",      desc: "Turn in 1 Salmon.",         itemId: ID_FISH_ITEMS.SALMON,         amount: 1,  reward: 60,   rewardLabel: "60 Honey",  type: "fish" },
  { id: "turnin_catfish_1",   title: "Catfish Order",      desc: "Turn in 1 Catfish.",        itemId: ID_FISH_ITEMS.CATFISH,        amount: 1,  reward: 70,   rewardLabel: "70 Honey",  type: "fish" },
  { id: "turnin_roughy_1",    title: "Rare Catch",         desc: "Turn in 1 Orange Roughy.",  itemId: ID_FISH_ITEMS.ORANGE_ROUGHY,  amount: 1,  reward: 100,  rewardLabel: "100 Gold", type: "fish" },
  { id: "turnin_shark_1",     title: "Shark Week",         desc: "Turn in 1 Small Shark.",    itemId: ID_FISH_ITEMS.SMALL_SHARK,    amount: 1,  reward: 180,  rewardLabel: "180 Gold", type: "fish" },
];

const STORAGE_KEY = "sandbox_mission_board_state";

const getLoot = () => {
  try {
    const loot = JSON.parse(localStorage.getItem('sandbox_loot') || '{}');
    const produce = JSON.parse(localStorage.getItem('sandbox_produce') || '{}');
    const merged = { ...loot };
    Object.entries(produce).forEach(([id, val]) => {
      const count = Array.isArray(val) ? val.length : (Number(val) || 0);
      merged[id] = (merged[id] || 0) + count;
    });
    return merged;
  } catch { return {}; }
};
const getHoney = () => {
  try { return parseInt(localStorage.getItem('sandbox_honey') || '0', 10); } catch { return 0; }
};

const pickOne = (pool, excludeIds) => {
  const available = pool.filter(m => !excludeIds.includes(m.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled[0] || null;
};

const pickThree = (pool, excludeIds = []) => {
  const available = pool.filter(m => !excludeIds.includes(m.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

const loadState = () => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};
const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

const formatCountdown = (ms) => {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const MissionBoard = ({ onClose }) => {
  const [missions, setMissions] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loot, setLoot] = useState({});
  const [honey, setHoney] = useState(0);
  const [feedback, setFeedback] = useState({});
  // skipTimers: { [slotIndex]: { replacesAt: timestamp, pendingMission } }
  const [skipTimers, setSkipTimers] = useState({});
  const [now, setNow] = useState(Date.now());
  const tickRef = useRef(null);

  // Tick every second to update countdowns and refresh inventory
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setNow(Date.now());
      setLoot(getLoot());
      setHoney(getHoney());
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  // When a skip timer expires, replace the slot
  useEffect(() => {
    setSkipTimers(prev => {
      const updated = { ...prev };
      let changed = false;
      Object.entries(updated).forEach(([slotIdx, timer]) => {
        if (now >= timer.replacesAt) {
          changed = true;
          const idx = parseInt(slotIdx);
          setMissions(prevMissions => {
            const next = [...prevMissions];
            next[idx] = timer.pendingMission;
            saveState({ missions: next, totalCompleted });
            return next;
          });
          delete updated[slotIdx];
        }
      });
      return changed ? updated : prev;
    });
  }, [now, totalCompleted]);

  useEffect(() => {
    setLoot(getLoot());
    setHoney(getHoney());
    const saved = loadState();
    const validMissions = (saved?.missions || []).filter(m => m.itemId != null && m.amount != null);
    if (validMissions.length === 3) {
      setMissions(validMissions);
      setTotalCompleted(saved.totalCompleted || 0);
      // Restore any active skip timers
      if (saved.skipTimers) setSkipTimers(saved.skipTimers);
    } else {
      const initial = pickThree(MISSION_POOL, []);
      setMissions(initial);
      saveState({ missions: initial, totalCompleted: saved?.totalCompleted || 0 });
    }
  }, []);

  const skipMission = useCallback((slotIdx, missionId) => {
    setMissions(prev => {
      const excludeIds = [...prev.map(m => m.id), missionId];
      const pending = pickOne(MISSION_POOL, excludeIds);
      if (!pending) return prev;

      const replacesAt = Date.now() + SKIP_COOLDOWN_MS;
      const timer = { replacesAt, pendingMission: pending };

      setSkipTimers(t => {
        const updated = { ...t, [slotIdx]: timer };
        saveState({ missions: prev, totalCompleted, skipTimers: updated });
        return updated;
      });

      return prev; // missions array unchanged until timer fires
    });
  }, [totalCompleted]);

  const turnIn = useCallback((mission, slotIdx) => {
    const currentLoot = getLoot();
    const have = currentLoot[mission.itemId] || 0;

    if (have < mission.amount) {
      setFeedback(f => ({ ...f, [mission.id]: `Need ${mission.amount - have} more!` }));
      setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[mission.id]; return n; }), 2000);
      return;
    }

    // Deduct from sandbox_produce first, then sandbox_loot for any remainder
    let remaining = mission.amount;
    const produce = JSON.parse(localStorage.getItem('sandbox_produce') || '{}');
    const produceVal = produce[mission.itemId];
    if (produceVal !== undefined) {
      const produceCount = Array.isArray(produceVal) ? produceVal.length : (Number(produceVal) || 0);
      const deduct = Math.min(remaining, produceCount);
      if (Array.isArray(produce[mission.itemId])) {
        produce[mission.itemId].splice(0, deduct);
      } else {
        produce[mission.itemId] = Math.max(0, produceCount - deduct);
      }
      remaining -= deduct;
      localStorage.setItem('sandbox_produce', JSON.stringify(produce));
    }
    const sandboxLoot = JSON.parse(localStorage.getItem('sandbox_loot') || '{}');
    if (remaining > 0 && sandboxLoot[mission.itemId]) {
      sandboxLoot[mission.itemId] = Math.max(0, (sandboxLoot[mission.itemId] || 0) - remaining);
      localStorage.setItem('sandbox_loot', JSON.stringify(sandboxLoot));
    }

    const newHoney = getHoney() + mission.reward;
    localStorage.setItem('sandbox_honey', String(newHoney));
    window.dispatchEvent(new CustomEvent('sandboxHoneyChanged', { detail: String(newHoney) }));
    setLoot(getLoot());
    setHoney(newHoney);

    setMissions(prev => {
      const excludeIds = [...prev.map(m => m.id), mission.id];
      const replacement = pickOne(MISSION_POOL, excludeIds);
      const next = [...prev];
      next[slotIdx] = replacement || mission; // fallback: keep same if pool exhausted
      const newTotal = totalCompleted + 1;
      saveState({ missions: next, totalCompleted: newTotal });
      setTotalCompleted(newTotal);
      return next;
    });
  }, [totalCompleted]);

  const tier = Math.floor(totalCompleted / 5) + 1;

  return (
    <div className="mission-board-overlay" onClick={onClose}>
      <div className="mission-board-panel" onClick={e => e.stopPropagation()}>
        <div className="mission-board-header">
          <span className="mission-board-title">Mission Board</span>
          <span className="mission-board-tier">Tier {tier}</span>
          <span className="mission-board-gold">Honey: {honey}</span>
          <button className="mission-board-close" onClick={onClose}>✕</button>
        </div>

        <div className="mission-board-cards">
          {missions.map((m, slotIdx) => {
            const have = loot[m.itemId] || 0;
            const canTurnIn = have >= m.amount;
            const timer = skipTimers[slotIdx];
            const msLeft = timer ? timer.replacesAt - now : 0;
            const isOnCooldown = timer && msLeft > 0;

            return (
              <div key={slotIdx} className={`mission-card ${canTurnIn && !isOnCooldown ? 'mission-card-ready' : ''}`}>
                {isOnCooldown ? (
                  <div className="mission-card-out-of-order">
                    <div className="out-of-order-tape">OUT OF ORDER</div>
                    <div className="out-of-order-timer">New mission in<br /><strong>{formatCountdown(msLeft)}</strong></div>
                  </div>
                ) : (
                  <>
                <div className="mission-card-type">{m.type.toUpperCase()}</div>
                <div className="mission-card-title">{m.title}</div>
                <div className="mission-card-desc">{m.desc}</div>
                <div className="mission-card-progress">
                  {have} / {m.amount} &nbsp;
                  {canTurnIn ? '✓ Ready!' : `(Need ${m.amount - have} more)`}
                </div>
                <div className="mission-card-reward">Reward: {m.rewardLabel}</div>
                {feedback[m.id] && (
                  <div className="mission-card-feedback">{feedback[m.id]}</div>
                )}
                  </>
                )}
                {!isOnCooldown && (
                  <div className="mission-card-buttons">
                    <BaseButton
                      label="Turn In"
                      small
                      disabled={!canTurnIn}
                      onClick={() => turnIn(m, slotIdx)}
                    />
                    <BaseButton
                      label="Skip"
                      small
                      isError
                      onClick={() => skipMission(slotIdx, m.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mission-board-footer">
          {totalCompleted} missions completed &nbsp;·&nbsp; Next tier in {5 - (totalCompleted % 5)} missions
        </div>
      </div>
    </div>
  );
};

export default MissionBoard;
