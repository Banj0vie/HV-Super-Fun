import React, { useState, useRef, useEffect } from "react";
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

const PokemonPackRipDialog = ({ rollingInfo, onClose, onBack, onBuyAgain }) => {
  const [ripProgress, setRipProgress] = useState(0);
  const [isRipped, setIsRipped] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [flipDone, setFlipDone] = useState(new Set());
  const isDragging = useRef(false);
  const startX = useRef(0);

  const isReadyToRip = rollingInfo.isComplete && !rollingInfo.isFallback;
  const revealedSeeds = rollingInfo.revealedSeeds || [];
  const bonusCards = rollingInfo.id === 'pabee_pack' ? [
    { type: 'gold', label: '1000 HONEY', image: '/images/profile_bar/unlocked_balance_icon.png', color: '#ffea00' },
    { type: 'gems', label: '250 Gems', emoji: '💎', color: '#00bfff' },
  ] : [];
  const totalCards = revealedSeeds.length + bonusCards.length;

  const handlePointerDown = (e) => {
    if (!isReadyToRip || isRipped) return;
    isDragging.current = true;
    let clientX = e.clientX;
    if (clientX === undefined && e.touches) clientX = e.touches[0].clientX;
    startX.current = clientX;
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || isRipped) return;
    let currentX = e.clientX;
    if (currentX === undefined && e.touches) currentX = e.touches[0].clientX;
    if (currentX === undefined) return;
    const diff = currentX - startX.current;
    const progress = Math.max(0, Math.min(100, (diff / 150) * 100));
    setRipProgress(progress);
    if (progress >= 100) {
      setIsRipped(true);
      isDragging.current = false;
      setTimeout(() => setShowCards(true), 1500);
    }
  };

  const handlePointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (ripProgress < 100) setRipProgress(0);
    }
  };

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [ripProgress, isReadyToRip, isRipped]);

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
        onClick={() => !flipped && flipCard(idx)}
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
    const item = ALL_ITEMS[seedId];
    const rarityType = item?.type || ID_RARE_TYPE.COMMON;
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
        <div style={{ position: 'relative', width: '250px', height: '350px', userSelect: 'none', touchAction: 'none', cursor: isReadyToRip ? 'grab' : 'wait' }} onPointerDown={handlePointerDown} onTouchStart={handlePointerDown}>
          {!isReadyToRip && (
            <div style={{ position: 'absolute', top: '-60px', left: '-50px', right: '-50px', textAlign: 'center', color: '#00bfff', fontSize: '16px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
              Receiving Oracle Randomness...
              <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
            </div>
          )}
          {isReadyToRip && !isRipped && (
            <div style={{ position: 'absolute', top: '-40px', left: 0, width: '100%', textAlign: 'center', color: '#00ff41', fontSize: '18px', fontWeight: 'bold', animation: 'bounce 1s infinite' }}>
              Swipe to Rip! --&gt;
              <style>{`@keyframes bounce { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }`}</style>
            </div>
          )}

          <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}>
            <img src="/images/cardback/commonback.png" alt="Pack" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>

          {isReadyToRip && ripProgress > 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: `${ripProgress}%`, height: '25%', boxShadow: '0 0 50px 20px rgba(255, 234, 0, 1), inset 0 0 20px 10px rgba(255, 255, 255, 1)', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9, borderTopLeftRadius: '12px', pointerEvents: 'none', opacity: ripProgress / 100 }} />
          )}

          {isReadyToRip && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '25%', backgroundColor: '#8a623e', borderBottom: '3px dashed rgba(255,255,255,0.5)', transformOrigin: 'top right', transform: `rotate(${ripProgress * 0.5}deg) translateX(${ripProgress * 1.5}px)`, opacity: 1 - (ripProgress / 100), zIndex: 10 }} />
          )}

          {isRipped && revealedSeeds.map((seedId, idx) => {
            const angle = (Math.PI * 2 * idx) / revealedSeeds.length;
            const tx = Math.cos(angle) * 200;
            const ty = Math.sin(angle) * 200 - 100;
            return (
              <div key={idx} style={{ position: 'absolute', top: '50%', left: '50%', width: '60px', height: '60px', marginLeft: '-30px', marginTop: '-30px', backgroundColor: '#1f1610', borderRadius: '8px', border: '2px solid #00ff41', animation: `burstOut 1s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)`, animationDelay: `${idx * 0.1}s`, opacity: 0, zIndex: 5, '--tx': `${tx}px`, '--ty': `${ty}px` }}>
                <style>{`@keyframes burstOut { 0% { transform: translate(0, 0) scale(0.5); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(1.5) rotate(720deg); opacity: 0; } }`}</style>
              </div>
            );
          })}
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
