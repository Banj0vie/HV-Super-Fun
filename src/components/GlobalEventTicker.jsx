import React, { useState, useEffect, useRef } from 'react';

const USERNAMES = [
  'FarmKing99', 'SunflowerSue', 'TaterTot42', 'ReelDeal', 'CropTop',
  'HarvestMoon', 'BigBassB', 'PlowMaster', 'GoldenRow', 'SeedWhisperer',
  'TroutHunter', 'VeggieVibes', 'MojoPete', 'AnglerAce', 'DirtNapper',
  'CornQueen', 'FishFrenzy', 'GreenThumb', 'LureKing', 'BumperCrop',
];

const LEGENDARY_FISH = [
  { name: 'Deep Ocean Giant', image: '/images/fish/DEEP OCEAN FISH .png' },
  { name: 'Ancient Tai', image: '/images/fish/Tai.png' },
  { name: 'Shadow Aji', image: '/images/fish/Aji.png' },
  { name: 'Titan of the Deep', image: '/images/fish/DEEP OCEAN FISH(SMALL).png' },
  { name: 'Finding Nimo', image: '/images/fish/FindingNimofish.png' },
];

const EPIC_FISH = [
  { name: 'Ocean Wanderer', image: '/images/fish/Normal Ocean Fish.png' },
  { name: 'Sea Phantom', image: '/images/fish/Normal Ocean Fish (2).png' },
  { name: 'Mysterious Catch', image: '/images/fish/Mysteriouse.gif' },
];

const SHINY_SEEDS = [
  { name: 'Shiny Dragon Fruit', image: '/images/cardfront/dragonfruit/dragcom.png' },
  { name: 'Shiny Pumpkin', image: '/images/cardfront/pumpkin/pumpuncom.png' },
  { name: 'Shiny Mango', image: '/images/cardfront/mango/mangouncom.png' },
  { name: 'Shiny Pomegranate', image: '/images/cardfront/pomegranate/pomuncom.png' },
  { name: 'Shiny Lychee', image: '/images/cardfront/lychee/lyuncom.png' },
  { name: 'Shiny Blueberry', image: '/images/cardfront/blueberry/bbuncom.png' },
  { name: 'Shiny Lavender', image: '/images/cardfront/lavender/lavuncom.png' },
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateEvent = () => {
  const roll = Math.random();
  const user = rand(USERNAMES);
  if (roll < 0.33) {
    const fish = rand(LEGENDARY_FISH);
    return { type: 'legendary', user, item: fish.name, image: fish.image };
  } else if (roll < 0.66) {
    const fish = rand(EPIC_FISH);
    return { type: 'epic', user, item: fish.name, image: fish.image };
  } else {
    const seed = rand(SHINY_SEEDS);
    return { type: 'shiny', user, item: seed.name, image: seed.image };
  }
};

export default function GlobalEventTicker() {
  const [event, setEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const isTutorialActive = () => {
    const step = parseInt(localStorage.getItem('sandbox_tutorial_step') || '0', 10);
    return step < 32;
  };

  const showNext = () => {
    if (isTutorialActive()) {
      timeoutRef.current = setTimeout(showNext, 5000);
      return;
    }
    const next = generateEvent();
    setEvent(next);
    setVisible(true);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = setTimeout(showNext, 1500);
    }, 4500);
  };

  useEffect(() => {
    // Random delay before first event so it doesn't fire instantly on load
    timeoutRef.current = setTimeout(showNext, 3000 + Math.random() * 4000);
    return () => clearTimeout(timeoutRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!event) return null;

  const isLegendary = event.type === 'legendary';
  const isEpic      = event.type === 'epic';
  const isShiny     = event.type === 'shiny';

  return (
    <>
      <style>{`
        @keyframes tickerSlideDown {
          0%   { transform: translateX(calc(-50% + 20px)) translateY(-100%); opacity: 0; }
          15%  { transform: translateX(calc(-50% + 20px)) translateY(0);    opacity: 1; }
          85%  { transform: translateX(calc(-50% + 20px)) translateY(0);    opacity: 1; }
          100% { transform: translateX(calc(-50% + 20px)) translateY(-100%); opacity: 0; }
        }
        @keyframes rainbowShift {
          0%   { color: #ff4444; }
          16%  { color: #ffaa00; }
          33%  { color: #ffff00; }
          50%  { color: #44ff44; }
          66%  { color: #44aaff; }
          83%  { color: #aa44ff; }
          100% { color: #ff4444; }
        }
        @keyframes legendaryGlow {
          0%,100% { text-shadow: 0 0 8px #ffaa00, 0 0 20px #ffaa0088; }
          50%     { text-shadow: 0 0 16px #ffdd44, 0 0 40px #ffaa0066; }
        }
        @keyframes rainbowBorder {
          0%   { border-color: #ff4444; box-shadow: 0 4px 24px #ff444466; }
          16%  { border-color: #ffaa00; box-shadow: 0 4px 24px #ffaa0066; }
          33%  { border-color: #ffff00; box-shadow: 0 4px 24px #ffff0066; }
          50%  { border-color: #44ff44; box-shadow: 0 4px 24px #44ff4466; }
          66%  { border-color: #44aaff; box-shadow: 0 4px 24px #44aaff66; }
          83%  { border-color: #aa44ff; box-shadow: 0 4px 24px #aa44ff66; }
          100% { border-color: #ff4444; box-shadow: 0 4px 24px #ff444466; }
        }
        @keyframes goldBorder {
          0%,100% { box-shadow: 0 4px 24px #ffaa0088, inset 0 0 12px #ffaa0022; }
          50%     { box-shadow: 0 4px 40px #ffdd4499, inset 0 0 20px #ffaa0033; }
        }
        @keyframes epicGlow {
          0%,100% { text-shadow: 0 0 8px #6644ff, 0 0 20px #6644ff88; }
          50%     { text-shadow: 0 0 16px #aa88ff, 0 0 40px #6644ff66; }
        }
        @keyframes epicBorder {
          0%,100% { box-shadow: 0 4px 24px #6644ff88, inset 0 0 12px #6644ff22; border-color: #6644ff; }
          50%     { box-shadow: 0 4px 40px #aa88ff99, inset 0 0 20px #6644ff33; border-color: #aa88ff; }
        }
      `}</style>

      {visible && (
        <div style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(calc(-50% + 20px))',
          zIndex: 100,
          animation: 'tickerSlideDown 4.5s ease-in-out forwards',
          pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px 4px 5px',
            borderRadius: '40px',
            border: `2px solid ${isLegendary ? '#ffaa00' : isEpic ? '#6644ff' : '#fff'}`,
            background: isLegendary
              ? 'linear-gradient(135deg, rgba(20,12,0,0.95), rgba(40,25,0,0.95))'
              : isEpic
              ? 'linear-gradient(135deg, rgba(10,5,30,0.95), rgba(25,10,60,0.95))'
              : 'linear-gradient(135deg, rgba(10,0,30,0.95), rgba(30,0,60,0.95))',
            animation: isLegendary ? 'goldBorder 1.5s ease-in-out infinite' : isEpic ? 'epicBorder 1.5s ease-in-out infinite' : 'rainbowBorder 1.5s linear infinite',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
          }}>
            {/* Icon badge */}
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: isLegendary ? 'rgba(255,170,0,0.2)' : isEpic ? 'rgba(102,68,255,0.2)' : 'rgba(180,100,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', flexShrink: 0,
            }}>
              {isLegendary ? '🏆' : isEpic ? '🎣' : '✨'}
            </div>

            {/* Item image */}
            <img
              src={event.image}
              alt={event.item}
              style={{
                width: '24px', height: '24px',
                objectFit: 'contain', borderRadius: '4px', flexShrink: 0,
                filter: isShiny
                  ? 'drop-shadow(0 0 4px #fff) saturate(1.5)'
                  : isEpic
                  ? 'drop-shadow(0 0 6px #6644ff)'
                  : 'drop-shadow(0 0 6px #ffaa00)',
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />

            {/* Text */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline', fontFamily: 'monospace' }}>
              <span style={{
                fontWeight: 'bold', fontSize: '11px', color: '#fff',
              }}>
                {event.user}
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                {isShiny ? 'pulled a' : 'caught a'}
              </span>
              <span style={{
                fontWeight: 'bold', fontSize: '11px',
                animation: isLegendary ? 'legendaryGlow 1.5s ease-in-out infinite' : isEpic ? 'epicGlow 1.5s ease-in-out infinite' : 'rainbowShift 1.5s linear infinite',
                color: isLegendary ? '#ffaa00' : isEpic ? '#aa88ff' : undefined,
              }}>
                {isShiny ? `🌱 ${event.item}` : `🐟 ${event.item}`}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 'bold', padding: '1px 6px', borderRadius: '10px',
                background: isLegendary ? '#ffaa00' : isEpic ? 'linear-gradient(90deg,#6644ff,#aa44ff)' : 'linear-gradient(90deg,#ff44aa,#aa44ff)',
                color: isLegendary ? '#000' : '#fff',
                marginLeft: '2px',
              }}>
                {isLegendary ? 'LEGENDARY' : isEpic ? 'EPIC' : 'SHINY'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
