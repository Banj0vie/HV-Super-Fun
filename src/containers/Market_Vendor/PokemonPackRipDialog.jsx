import React, { useState, useEffect, useRef } from "react";
import BaseButton from "../../components/buttons/BaseButton";
import { ALL_ITEMS, IMAGE_URL_CROP } from "../../constants/item_data";
import { ONE_SEED_HEIGHT, ONE_SEED_WIDTH } from "../../constants/item_seed";
import { ID_SEEDS, ID_RARE_TYPE } from "../../constants/app_ids";

// Card front images keyed by [baseId][rarityLevel]
const CARD_FRONT_IMAGES = {
  [ID_SEEDS.ONION]: {
    1: "/images/cardfront/onioncard/onioncom.png",
    2: "/images/cardfront/onioncard/onionuncom.png",
    3: "/images/cardfront/onioncard/onionrare.png",
    4: "/images/cardfront/onioncard/onionepic.png",
    5: "/images/cardfront/onioncard/onionleg.png",
  },
  [ID_SEEDS.POTATO]: {
    1: "/images/cardfront/potatocard/potatocom.png",
    2: "/images/cardfront/potatocard/potatouncom.png",
    3: "/images/cardfront/potatocard/potatorare.png",
    4: "/images/cardfront/potatocard/potatoepic.png",
    5: "/images/cardfront/potatocard/potatoleg.png",
  },
  [ID_SEEDS.BLUEBERRY]: {
    1: "/images/cardfront/blueberry/bbcom.png",
    2: "/images/cardfront/blueberry/bbuncom.png",
    3: "/images/cardfront/blueberry/blueberryrare.png",
    4: "/images/cardfront/blueberry/blueberryepic.png",
    5: "/images/cardfront/blueberry/blueberryleg.png",
  },
  [ID_SEEDS.BROCCOLI]: {
    1: "/images/cardfront/broccoli/broccom.png",
    2: "/images/cardfront/broccoli/brocuncom.png",
    3: "/images/cardfront/broccoli/brocrare.png",
    4: "/images/cardfront/broccoli/brocepic.png",
    5: "/images/cardfront/broccoli/brocleg.png",
  },
  [ID_SEEDS.CELERY]: {
    1: "/images/cardfront/celery/celcom.png",
    2: "/images/cardfront/celery/celuncom.png",
    3: "/images/cardfront/celery/celrare.png",
    4: "/images/cardfront/celery/celepic.png",
    5: "/images/cardfront/celery/celleg.png",
  },
  [ID_SEEDS.GRAPES]: {
    1: "/images/cardfront/grape/grapecom.png",
    2: "/images/cardfront/grape/grapeuncom.png",
    3: "/images/cardfront/grape/graperare.png",
    4: "/images/cardfront/grape/grapeepic.png",
    5: "/images/cardfront/grape/grapeleg.png",
  },
  [ID_SEEDS.PEPPER]: {
    1: "/images/cardfront/pepper/peppercom.png",
    2: "/images/cardfront/pepper/pepperuncom.png",
    3: "/images/cardfront/pepper/pepperrare.png",
    4: "/images/cardfront/pepper/pepperepic.png",
    5: "/images/cardfront/pepper/pepperleg.png",
  },
  [ID_SEEDS.PINEAPPLE]: {
    1: "/images/cardfront/pineapplecard/pineapplecom.png",
    2: "/images/cardfront/pineapplecard/pineappleuncom.png",
    3: "/images/cardfront/pineapplecard/pineapplerare.png",
    4: "/images/cardfront/pineapplecard/pineappleepic.png",
    5: "/images/cardfront/pineapplecard/pineappleleg.png",
  },
  [ID_SEEDS.MANGO]: {
    1: "/images/cardfront/mango/mangocom.png",
    2: "/images/cardfront/mango/mangouncom.png",
    3: "/images/cardfront/mango/mangorare.png",
    4: "/images/cardfront/mango/mangoepic.png",
    5: "/images/cardfront/mango/mangoleg.png",
  },
  [ID_SEEDS.PAPAYA]: {
    1: "/images/cardfront/papaya/papayacom.png",
    2: "/images/cardfront/papaya/papayauncom.png",
    3: "/images/cardfront/papaya/paprare.png",
    4: "/images/cardfront/papaya/papepic.png",
    5: "/images/cardfront/papaya/papleg.png",
  },
  [ID_SEEDS.PUMPKIN]: {
    1: "/images/cardfront/pumpkin/pumpcom.png",
    2: "/images/cardfront/pumpkin/pumpuncom.png",
    3: "/images/cardfront/pumpkin/pumprare.png",
    4: "/images/cardfront/pumpkin/pumpepic.png",
    5: "/images/cardfront/pumpkin/pumpleg.png",
  },
  [ID_SEEDS.TOMATO]: {
    1: "/images/cardfront/tomato/tomatocom.png",
    2: "/images/cardfront/tomato/tomatouncom.png",
    3: "/images/cardfront/tomato/tomatorare.png",
    4: "/images/cardfront/tomato/tomatoepic.png",
    5: "/images/cardfront/tomato/tomatoleg.png",
  },
  [ID_SEEDS.TURNIP]: {
    1: "/images/cardfront/turnip/turcom.png",
    2: "/images/cardfront/turnip/turuncom.png",
    3: "/images/cardfront/turnip/turniprare.png",
    4: "/images/cardfront/turnip/turnipepic.png",
    5: "/images/cardfront/turnip/turnipleg.png",
  },
  [ID_SEEDS.DRAGON_FRUIT]: {
    1: "/images/cardfront/dragonfruit/dragcom.png",
    2: "/images/cardfront/dragonfruit/draguncom.png",
    3: "/images/cardfront/dragonfruit/dragrare.png",
    4: "/images/cardfront/dragonfruit/dragepic.png",
    5: "/images/cardfront/dragonfruit/dragleg.png",
  },
  [ID_SEEDS.LETTUCE]: {
    1: "/images/cardfront/lettuce/letcom.png",
    2: "/images/cardfront/lettuce/letuncom.png",
    3: "/images/cardfront/lettuce/letrare.png",
    4: "/images/cardfront/lettuce/letepic.png",
    5: "/images/cardfront/lettuce/letleg.png",
  },
  [ID_SEEDS.LICHI]: {
    1: "/images/cardfront/lychee/lycom.png",
    2: "/images/cardfront/lychee/lyuncom.png",
    3: "/images/cardfront/lychee/lycrare.png",
    4: "/images/cardfront/lychee/lycepic.png",
    5: "/images/cardfront/lychee/lycleg.png",
  },
  [ID_SEEDS.RADISH]: {
    1: "/images/cardfront/radish/radcom.png",
    2: "/images/cardfront/radish/raduncom.png",
    3: "/images/cardfront/radish/radrare.png",
    4: "/images/cardfront/radish/radepic.png",
    5: "/images/cardfront/radish/radleg.png",
  },
  [ID_SEEDS.AVOCADO]: {
    1: "/images/cardfront/avocado/avocom.png",
    2: "/images/cardfront/avocado/avouncom.png",
    3: "/images/cardfront/avocado/avorare.png",
    4: "/images/cardfront/avocado/avoepic.png",
    5: "/images/cardfront/avocado/avoleg.png",
  },
  [ID_SEEDS.BANANA]: {
    1: "/images/cardfront/banana/bancom.png",
    2: "/images/cardfront/banana/banuncom.png",
    3: "/images/cardfront/banana/banrare.png",
    4: "/images/cardfront/banana/banepic.png",
    5: "/images/cardfront/banana/banleg.png",
  },
  [ID_SEEDS.CAULIFLOWER]: {
    1: "/images/cardfront/califlower/calicom.png",
    2: "/images/cardfront/califlower/caliuncom.png",
    3: "/images/cardfront/califlower/calirare.png",
    4: "/images/cardfront/califlower/caliepic.png",
    5: "/images/cardfront/califlower/calileg.png",
  },
  [ID_SEEDS.CORN]: {
    1: "/images/cardfront/corn/corncom.png",
    2: "/images/cardfront/corn/cornuncom.png",
    3: "/images/cardfront/corn/cornrare.png",
    4: "/images/cardfront/corn/cornepic.png",
    5: "/images/cardfront/corn/cornleg.png",
  },
  [ID_SEEDS.BOKCHOY]: {
    1: "/images/cardfront/bokchoy/bokcom.png",
    2: "/images/cardfront/bokchoy/bokuncom.png",
    3: "/images/cardfront/bokchoy/bchoyrare.png",
    4: "/images/cardfront/bokchoy/bchoyepic.png",
    5: "/images/cardfront/bokchoy/bchoyleg.png",
  },
  [ID_SEEDS.CARROT]: {
    1: "/images/cardfront/carrot/carcom.png",
    2: "/images/cardfront/carrot/caruncom.png",
    3: "/images/cardfront/carrot/carrare.png",
    4: "/images/cardfront/carrot/carepic.png",
    5: "/images/cardfront/carrot/carleg.png",
  },
  [ID_SEEDS.LAVENDER]: {
    1: "/images/cardfront/lavender/lavcom.png",
    2: "/images/cardfront/lavender/lavuncom.png",
    3: "/images/cardfront/lavender/lavrare.png",
    4: "/images/cardfront/lavender/lavepic.png",
    5: "/images/cardfront/lavender/lavleg.png",
  },
  [ID_SEEDS.WHEAT]: {
    1: "/images/cardfront/wheat/wheatcom.png",
    2: "/images/cardfront/wheat/wheatuncom.png",
    3: "/images/cardfront/wheat/wheatrare.png",
    4: "/images/cardfront/wheat/wheatepic.png",
    5: "/images/cardfront/wheat/wheatleg.png",
  },
  [ID_SEEDS.POMEGRANATE]: {
    1: "/images/cardfront/pomegranate/pomcom.png",
    2: "/images/cardfront/pomegranate/pomuncom.png",
    3: "/images/cardfront/pomegranate/pomrare.png",
    4: "/images/cardfront/pomegranate/pomepic.png",
    5: "/images/cardfront/pomegranate/pomleg.png",
  },
  [ID_SEEDS.APPLE]: {
    1: "/images/cardfront/apple/appcom.png",
    2: "/images/cardfront/apple/appuncom.png",
    3: "/images/cardfront/apple/applerare.png",
    4: "/images/cardfront/apple/appleepic.png",
    5: "/images/cardfront/apple/appleleg.png",
  },
  [ID_SEEDS.EGGPLANT]: {
    1: "/images/cardfront/eggplant/epcom.png",
    2: "/images/cardfront/eggplant/epuncom.png",
    3: "/images/cardfront/eggplant/epicrare.png",
    4: "/images/cardfront/eggplant/eggepic.png",
    5: "/images/cardfront/eggplant/eggleg.png",
  },
};

// Extracts the base seed ID (strips rarity bits 12-14) and rarity level
const getBaseAndRarity = (seedId) => {
  const rarity = (seedId >> 12) & 0xF;
  const baseId = seedId & 0xFFF;
  return { baseId, rarityLevel: rarity || 1 };
};

const CARD_BACK_IMAGES = {
  [ID_RARE_TYPE.COMMON]:    "/images/cardback/commonback.png",
  [ID_RARE_TYPE.UNCOMMON]:  "/images/cardback/uncommonback.png",
  [ID_RARE_TYPE.RARE]:      "/images/cardback/rareback.png",
  [ID_RARE_TYPE.EPIC]:      "/images/cardback/epicback.png",
  [ID_RARE_TYPE.LEGENDARY]: "/images/cardback/legendaryback.png",
};

const CARD_GLOW_TYPES = new Set([ID_RARE_TYPE.LEGENDARY]);

const PICO_IDLE_FRAMES = 19;
const PICO_IDLE_FPS = 12;

const PicoPackIdle = () => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % PICO_IDLE_FRAMES), 1000 / PICO_IDLE_FPS);
    return () => clearInterval(interval);
  }, []);
  const frameStr = String(frame).padStart(5, '0');
  return (
    <img
      src={`/images/cardfront/card1idle/idle_1/idle_1_${frameStr}.png`}
      alt="Pico Seeds Pack"
      draggable={false}
      style={{ height: '80vh', objectFit: 'contain', display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

const OPEN_FRAMES = 25;        // open_1_00019 → open_1_00043
const OPEN_FRAME_OFFSET = 19;  // first frame number
const DRAG_PX_FULL = 1200;     // horizontal px needed to reach last frame

const PokemonPackRipDialog = ({ rollingInfo, onClose, onBack, onBuyAgain }) => {
  const [showCards, setShowCards] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [flipDone, setFlipDone] = useState(new Set());

  // Pack-opening scrub state
  const [phase, setPhase] = useState('idle'); // 'idle' | 'opening' | 'reversing'
  const [openFrame, setOpenFrame] = useState(0);
  const phaseRef = useRef('idle');
  const openFrameRef = useRef(0);
  const startXRef = useRef(0);
  const reverseRafRef = useRef(null);
  const containerRef = useRef(null);

  const syncPhase = (p) => { phaseRef.current = p; setPhase(p); };
  const syncFrame = (f) => { openFrameRef.current = f; setOpenFrame(f); };

  const handlePointerDown = (e) => {
    if (phaseRef.current !== 'idle') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left - 125;
    const relY = e.clientY - rect.top - 70;
    // Only trigger from the top-left corner of the pack
    if (relX < rect.width * 0.22 && relY < rect.height * 0.12) {
      if (reverseRafRef.current) { cancelAnimationFrame(reverseRafRef.current); reverseRafRef.current = null; }
      startXRef.current = e.clientX;
      syncPhase('opening');
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (phaseRef.current !== 'opening') return;
    const DEAD_ZONE = 50;
    const diff = Math.max(0, e.clientX - startXRef.current - DEAD_ZONE);
    const frame = Math.min(OPEN_FRAMES - 1, Math.floor((diff / DRAG_PX_FULL) * OPEN_FRAMES));
    syncFrame(frame);
    if (frame >= OPEN_FRAMES - 1) {
      syncPhase('complete');
      setTimeout(() => setShowCards(true), 300);
    }
  };

  const handlePointerUp = () => {
    if (phaseRef.current !== 'opening') return;
    if (openFrameRef.current >= OPEN_FRAMES * 0.4) {
      syncPhase('completing');
      const finish = () => {
        const cur = openFrameRef.current;
        if (cur >= OPEN_FRAMES - 1) {
          syncPhase('complete');
          setShowCards(true);
          reverseRafRef.current = null;
          return;
        }
        syncFrame(Math.min(OPEN_FRAMES - 1, cur + 1));
        reverseRafRef.current = requestAnimationFrame(finish);
      };
      reverseRafRef.current = requestAnimationFrame(finish);
      return;
    }
    syncPhase('reversing');
    const step = () => {
      const cur = openFrameRef.current;
      if (cur <= 0) { syncPhase('idle'); syncFrame(0); reverseRafRef.current = null; return; }
      syncFrame(Math.max(0, cur - 2));
      reverseRafRef.current = requestAnimationFrame(step);
    };
    reverseRafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => { if (reverseRafRef.current) cancelAnimationFrame(reverseRafRef.current); };
  }, []);

  const revealedSeeds = rollingInfo.revealedSeeds || [];
  const bonusCards = rollingInfo.id === 'pabee_pack' ? [
    { type: 'gold', label: '1000 HONEY', image: '/images/profile_bar/unlocked_balance_icon.png', color: '#ffea00' },
    { type: 'gems', label: '250 Gems', emoji: '💎', color: '#00bfff' },
  ] : [];
  const totalCards = revealedSeeds.length + bonusCards.length;

  const flipCard = (idx) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const flipAll = () => {
    let delay = 0;
    for (let i = 0; i < totalCards; i++) {
      if (flippedCards.has(i)) continue;
      const interval = Math.max(250, 800 - i * 130);
      setTimeout(() => {
        setFlippedCards(prev => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
      }, delay);
      delay += interval;
    }
  };

  const allFlipped = flippedCards.size === totalCards && totalCards > 0;

  const renderBonusCard = (bonus, idx) => {
    const flipped = flippedCards.has(idx);
    return (
      <div
        key={`bonus-${idx}`}
        onClick={() => { if (!flipped) flipCard(idx); }}
        draggable={false}
        onDragStart={e => e.preventDefault()}
        style={{ width: '220px', height: '310px', position: 'relative', cursor: flipped ? 'default' : 'pointer', flexShrink: 0, perspective: '600px', userSelect: 'none' }}
      >
        <div
          className={`card-inner${flipped ? ' flipped' : ''}`}
          onTransitionEnd={() => {
            if (flipped) setFlipDone(prev => { const n = new Set(prev); n.add(idx); return n; });
          }}
        >
          {/* Back face */}
          <div className="card-face card-back-face">
            <img src="/images/cardback/commonback.png" alt="Card Back" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }} />
          </div>
          {/* Front face */}
          <div className="card-face card-front-face" style={{ backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            {bonus.emoji
              ? <span style={{ fontSize: '64px', lineHeight: 1, filter: `drop-shadow(0 0 12px ${bonus.color})` }}>{bonus.emoji}</span>
              : <img src={bonus.image} alt={bonus.label} style={{ width: '80px', height: '80px', objectFit: 'contain', filter: `drop-shadow(0 0 12px ${bonus.color})` }} />
            }
            <span style={{ fontFamily: 'Cartoonist', fontSize: '20px', color: bonus.color, textShadow: '1px 1px 0 #000', textAlign: 'center' }}>{bonus.label}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCardFront = (seedId) => {
    const { baseId, rarityLevel } = getBaseAndRarity(seedId);
    const item = ALL_ITEMS[seedId];
    const customCardFront = CARD_FRONT_IMAGES[baseId]?.[rarityLevel];

    if (customCardFront) {
      return <img src={customCardFront} alt={item?.label} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }} />;
    }

    return null;
  };

  const renderCard = (seedId, idx) => {
    const { rarityLevel } = getBaseAndRarity(seedId);
    // Map rarityLevel (1–5) to ID_RARE_TYPE so back image matches front rarity
    const rarityLevelToType = { 1: ID_RARE_TYPE.COMMON, 2: ID_RARE_TYPE.UNCOMMON, 3: ID_RARE_TYPE.RARE, 4: ID_RARE_TYPE.EPIC, 5: ID_RARE_TYPE.LEGENDARY };
    const rarityType = rarityLevelToType[rarityLevel] || ID_RARE_TYPE.COMMON;
    const backImg = CARD_BACK_IMAGES[rarityType] || CARD_BACK_IMAGES[ID_RARE_TYPE.COMMON];
    const hasGlow = CARD_GLOW_TYPES.has(rarityType);
    const flipped = flippedCards.has(idx);
    const showGlow = hasGlow && (!flipped || flipDone.has(idx));

    return (
      <div
        key={idx}
        onClick={() => !flipped && flipCard(idx)}
        draggable={false}
        onDragStart={e => e.preventDefault()}
        style={{ width: '220px', height: '310px', position: 'relative', cursor: flipped ? 'default' : 'pointer', flexShrink: 0, perspective: '600px', userSelect: 'none' }}
      >
        {showGlow && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '340px', height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,200,30,0.55) 0%, rgba(255,140,0,0.3) 35%, rgba(255,80,0,0.1) 60%, transparent 75%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: -1,
            animation: 'legGlow 2.4s ease-in-out infinite',
          }} />
        )}
        <div
          className={`card-inner${flipped ? ' flipped' : ''}`}
          onTransitionEnd={() => {
            if (flipped) setFlipDone(prev => { const n = new Set(prev); n.add(idx); return n; });
          }}
        >
          {/* Back face */}
          <div className="card-face card-back-face">
            <img src={backImg} alt="Card Back" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }} />
          </div>
          {/* Front face */}
          <div className="card-face card-front-face">
            {renderCardFront(seedId)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>

      {!showCards ? (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ userSelect: 'none', touchAction: 'none', cursor: phase === 'idle' ? 'default' : 'grabbing' }}
        >
          {phase === 'idle' || phase === 'complete'
            ? <PicoPackIdle />
            : /* opening | reversing | completing */ <img
                src={`/images/cardfront/card1open/open_1/open_1_${String(OPEN_FRAME_OFFSET + openFrame).padStart(5, '0')}.png`}
                draggable={false}
                style={{ height: '80vh', objectFit: 'contain', display: 'block', imageRendering: 'pixelated' }}
              />
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px', width: '100%' }}>
          <style>{`
            .card-inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.5s ease; }
            .card-inner.flipped { transform: rotateY(180deg); }
            .card-face { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); overflow: hidden; box-sizing: border-box; }
            .card-front-face { transform: rotateY(180deg); }
            @keyframes legGlow {
              0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
              50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.12); }
            }
          `}</style>
          {/* Cards row — fit all cards in one row, scale down if needed */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 220px)', gap: '28px', justifyContent: 'center', marginTop: '50px' }}>
            {revealedSeeds.map((seedId, idx) => renderCard(seedId, idx))}
            {bonusCards.map((bonus, i) => renderBonusCard(bonus, revealedSeeds.length + i))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            {!allFlipped && (
              <img
                src="/images/button/flipallbutton.png"
                alt="Flip All"
                onClick={flipAll}
                style={{ height: '104px', marginTop: '-5px', cursor: 'pointer', userSelect: 'none', transition: 'transform 0.08s, filter 0.08s' }}
                draggable={false}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.filter = 'brightness(0.85)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.filter = 'brightness(1.15)'; }}
              />
            )}
            {flipDone.size === totalCards && totalCards > 0 && (
              <>
                <img
                  src="/images/button/donebutton.png"
                  alt="Done"
                  onClick={onClose}
                  style={{ height: '104px', marginTop: '-5px', cursor: 'pointer', userSelect: 'none', transition: 'transform 0.08s, filter 0.08s' }}
                  draggable={false}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.filter = 'brightness(0.85)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.filter = 'brightness(1.15)'; }}
                />
                {onBuyAgain && (
                  <img
                    src="/images/button/buyagainbutton.png"
                    alt="Buy Again"
                    onClick={onBuyAgain}
                    style={{ height: '104px', marginTop: '-5px', cursor: 'pointer', userSelect: 'none', transition: 'transform 0.08s, filter 0.08s' }}
                    draggable={false}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.filter = 'brightness(0.85)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.filter = 'brightness(1.15)'; }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default PokemonPackRipDialog;
