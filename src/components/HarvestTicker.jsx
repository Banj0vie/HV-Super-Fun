import React, { useState, useEffect, useRef } from 'react';

const CROP_IMAGES = {
  'Potato':       '/images/cardfront/potatocard/potatocom.png',
  'Lettuce':      '/images/cardfront/lettuce/letcom.png',
  'Cabbage':      '/images/cardfront/califlower/calicom.png',
  'Onion':        '/images/cardfront/onioncard/onioncom.png',
  'Radish':       '/images/cardfront/radish/radcom.png',
  'Turnip':       '/images/cardfront/turnip/turcom.png',
  'Wheat':        '/images/cardfront/wheat/wheatcom.png',
  'Tomato':       '/images/cardfront/tomato/tomatocom.png',
  'Carrot':       '/images/cardfront/carrot/carcom.png',
  'Corn':         '/images/cardfront/corn/corncom.png',
  'Pumpkin':      '/images/cardfront/pumpkin/pumpcom.png',
  'Pepper':       '/images/cardfront/pepper/peppercom.png',
  'Celery':       '/images/cardfront/celery/celcom.png',
  'Broccoli':     '/images/cardfront/broccoli/broccom.png',
  'Cauliflower':  '/images/cardfront/califlower/calicom.png',
  'Berry':        '/images/cardfront/blueberry/bbcom.png',
  'Grapes':       '/images/cardfront/grape/grapecom.png',
  'Banana':       '/images/cardfront/banana/bancom.png',
  'Mango':        '/images/cardfront/mango/mangocom.png',
  'Avocado':      '/images/cardfront/avocado/avocom.png',
  'Pineapple':    '/images/cardfront/pineapplecard/pineapplecom.png',
  'Blueberry':    '/images/cardfront/blueberry/bbcom.png',
  'Papaya':       '/images/cardfront/papaya/papayacom.png',
  'Lichi':        '/images/cardfront/lychee/lycom.png',
  'Lavender':     '/images/cardfront/lavender/lavcom.png',
  'Dragon Fruit': '/images/cardfront/dragonfruit/dragcom.png',
  'Parsnip':      '/images/cardfront/radish/radcom.png',
  'Artichoke':    '/images/cardfront/bokchoy/bokcom.png',
  'Fig':          '/images/cardfront/grape/grapecom.png',
  'Eggplant':     '/images/cardfront/eggplant/epcom.png',
};

const DURATION = 7000;

export default function HarvestTicker() {
  const [event, setEvent] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      clearTimeout(timerRef.current);
      window.__harvestTickerActive = true;
      setEvent(e.detail);
      setAnimKey(k => k + 1); // restart animation
      timerRef.current = setTimeout(() => {
        window.__harvestTickerActive = false;
      }, DURATION);
    };
    window.addEventListener('cropHarvested', handler);
    return () => {
      window.removeEventListener('cropHarvested', handler);
      clearTimeout(timerRef.current);
      window.__harvestTickerActive = false;
    };
  }, []);

  if (!event) return null;

  const image = CROP_IMAGES[event.cropName];

  return (
    <>
      <style>{`
        @keyframes harvestSlideDown {
          0%   { transform: translateX(-50%) translateY(-110%); opacity: 0; }
          10%  { transform: translateX(-50%) translateY(0);     opacity: 1; }
          85%  { transform: translateX(-50%) translateY(0);     opacity: 1; }
          100% { transform: translateX(-50%) translateY(-110%); opacity: 0; }
        }
        @keyframes harvestGlow {
          0%,100% { text-shadow: 0 0 12px #aaff66, 0 0 28px #aaff6688; }
          50%     { text-shadow: 0 0 24px #ccff88, 0 0 56px #aaff6666; }
        }
        @keyframes harvestBorder {
          0%,100% { box-shadow: 0 6px 36px #44cc2299, inset 0 0 18px #44cc2222; border-color: #44cc22; }
          50%     { box-shadow: 0 6px 54px #88ff44bb, inset 0 0 32px #44cc2233; border-color: #88ff44; }
        }
      `}</style>
      <div
        key={animKey}
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 300,
          animation: `harvestSlideDown ${DURATION}ms ease-in-out forwards`,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 24px 12px 12px',
          borderRadius: '60px',
          border: '3px solid #44cc22',
          background: 'linear-gradient(135deg, rgba(8,25,5,0.97), rgba(18,50,10,0.97))',
          animation: 'harvestBorder 1.5s ease-in-out infinite',
          backdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap',
          minWidth: '360px',
        }}>
          {/* Icon badge */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'rgba(68,204,34,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', flexShrink: 0,
          }}>
            🌾
          </div>

          {/* Crop image */}
          {image && (
            <img
              src={image}
              alt={event.cropName}
              style={{
                width: '52px', height: '52px',
                objectFit: 'contain', borderRadius: '8px', flexShrink: 0,
                filter: 'drop-shadow(0 0 10px #44cc22)',
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}

          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontFamily: 'GROBOLD, Cartoonist, monospace' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>You harvested</span>
              <span style={{
                fontSize: '18px', fontWeight: 'bold',
                animation: 'harvestGlow 1.5s ease-in-out infinite',
                color: '#aaff66',
              }}>
                {event.cropName}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              Weight: <span style={{ color: '#f5d87a', fontWeight: 'bold' }}>{event.weight} kg</span>
            </div>
          </div>

          {/* HARVESTED badge */}
          <div style={{
            fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '14px',
            background: 'linear-gradient(90deg, #44cc22, #88ff44)',
            color: '#000', marginLeft: '4px', flexShrink: 0,
          }}>
            HARVESTED
          </div>
        </div>
      </div>
    </>
  );
}
