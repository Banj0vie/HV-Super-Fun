import React, { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const RARITY_COLORS = {
  COMMON: '#aaa', UNCOMMON: '#00cc44', RARE: '#4488ff',
  EPIC: '#aa44ff', LEGENDARY: '#ffaa00',
};

const FISH_DESCRIPTIONS = {
  Anchovy:        "A small silvery fish found in shallow coastal waters.",
  Sardin:         "A tiny but tasty fish loved by fishermen everywhere.",
  Herring:        "A mid-sized schooling fish with a distinctive silver sheen.",
  "Small Trout":  "A freshwater favourite with speckled markings.",
  "Yellow Perch": "A vibrant fish with bold yellow and green stripes.",
  Salmon:         "A powerful migratory fish prized for its rich flavour.",
  "Orange Roughy":"A deep-sea dweller with striking orange scales.",
  Catfish:        "A bottom-feeding giant lurking in murky depths.",
  "Small Shark":  "A juvenile shark — rare and thrilling to catch!",
  "Normal fish":  "An ordinary ocean fish, perfectly ordinary.",
  FISH_SMALL:     "A small mysterious fish from the deep.",
  FISH_LARGE:     "A large mysterious fish from the deep.",
};

const STAGE = {
  BUBBLES:     'BUBBLES',
  UNDERWATER:  'UNDERWATER',
  RARITY_FLASH:'RARITY_FLASH', // brief reveal before chase
  CHASE_RIGHT: 'CHASE_RIGHT',
  CHASE_LEFT:  'CHASE_LEFT',
  REEL:        'REEL',
  REVEAL:      'REVEAL',
  ESCAPED:     'ESCAPED',
};

// [approachStep, hitWindow, osuCount, targetDeg, escapePer]
const DIFF_CFG = [
  [0.055, 0.70, 7,  2160, 0.20], // 0 COMMON     — 7 circles, very forgiving
  [0.070, 0.62, 8,  2520, 0.25], // 1 UNCOMMON   — 8 circles
  [0.088, 0.55, 9,  2880, 0.30], // 2 RARE       — 9 circles
  [0.108, 0.48, 10, 3240, 0.35], // 3 EPIC       — 10 circles
  [0.130, 0.42, 12, 3600, 0.40], // 4 LEGENDARY  — 12 circles
];

const RARITY_WEIGHTS = [
  ['COMMON',    0.50],
  ['UNCOMMON',  0.25],
  ['RARE',      0.15],
  ['EPIC',      0.08],
  ['LEGENDARY', 0.02],
];

const rollRarity = () => {
  const r = Math.random();
  let cumulative = 0;
  for (const [rarity, weight] of RARITY_WEIGHTS) {
    cumulative += weight;
    if (r < cumulative) return rarity;
  }
  return 'COMMON';
};

const APPROACH_START = 2.8;
const APPROACH_MS    = 30;
const SPINNER_SIZE   = 650;
const UW_FISH_COUNT  = 6;

// ── Bubble ───────────────────────────────────────────────────────────────────
const Bubble = ({ style }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%',
    border: '2px solid rgba(100,200,255,0.6)',
    background: 'rgba(100,200,255,0.15)',
    animation: 'bubbleRise 1.8s ease-in forwards',
    ...style,
  }} />
);

// ── Main ─────────────────────────────────────────────────────────────────────
const FishingMiniGame = ({ fishItem, fishRarity: _fishRarity, fishWeight, onComplete, onEscape }) => {
  // difficulty is set dynamically when the player clicks a fish
  const diffRef    = useRef(0);
  const getDiff    = () => DIFF_CFG[diffRef.current];

  const [stage,         setStage]         = useState(STAGE.BUBBLES);
  const [bubbles,       setBubbles]       = useState([]);
  const [uwFish,        setUwFish]        = useState([]);
  const [selectedRarity,setSelectedRarity]= useState(null); // shown in rarity flash

  // Chase
  const [circles,       setCircles]       = useState([]);
  const [circleIdx,     setCircleIdx]     = useState(0);
  const [circleActive,  setCircleActive]  = useState(false);
  const [approachScale, setApproachScale] = useState(APPROACH_START);
  const [hitBurst,      setHitBurst]      = useState(null);
  const [missedCircle,  setMissedCircle]  = useState(null);
  const [missCount,     setMissCount]     = useState(0);
  const [shake,         setShake]         = useState(false);
  const [circleFlash,   setCircleFlash]   = useState(false);
  const missCountRef = useRef(0);
  const shrinkRef    = useRef(null);
  const shakeTimer   = useRef(null);
  const phaseRef     = useRef(1);
  const osuCountRef  = useRef(DIFF_CFG[0][2]); // updated when diff set

  // Reel
  const [reelFill,   setReelFill]   = useState(0);
  const [spinning,   setSpinning]   = useState(false);
  const [spinnerDeg, setSpinnerDeg] = useState(0);
  const lastAngleRef  = useRef(null);
  const reelRef       = useRef(null);
  const totalRotRef   = useRef(0);
  const spinnerDegRef = useRef(0);
  const completedRef  = useRef(false);

  // Reveal
  const [revealPhase,   setRevealPhase]   = useState(0);
  const [collectClicked,setCollectClicked]= useState(false);

  // ── Skip bubbles, go straight to UNDERWATER ───────────────────────────────
  useEffect(() => {
    setStage(STAGE.UNDERWATER);
  }, []);

  // ── Generate swimming fish when UNDERWATER ────────────────────────────────
  useEffect(() => {
    if (stage !== STAGE.UNDERWATER) return;
    const fish = Array.from({ length: UW_FISH_COUNT }, (_, i) => ({
      id: i,
      y: 18 + i * 12 + (Math.random() * 6 - 3), // spread vertically
      w: 110 + Math.random() * 120,               // width (bigger = more dramatic)
      h: 42 + Math.random() * 44,                 // height
      duration: 3.5 + Math.random() * 5,          // swim speed
      delay: Math.random() * 2.5,
      dir: i % 2 === 0 ? 'right' : 'left',
      blur: 8 + Math.random() * 10,
    }));
    setUwFish(fish);
  }, [stage]);

  // ── Fish click → roll rarity → rarity flash → chase ──────────────────────
  const handleFishClick = useCallback((e) => {
    e.stopPropagation();
    const rarity = rollRarity();
    const d = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'].indexOf(rarity);
    diffRef.current = Math.max(0, d);
    osuCountRef.current = DIFF_CFG[diffRef.current][2];
    setSelectedRarity(rarity);
    setStage(STAGE.RARITY_FLASH);
  }, []);

  // ── Rarity flash → start chase ────────────────────────────────────────────
  useEffect(() => {
    if (stage !== STAGE.RARITY_FLASH) return;
    const t = setTimeout(() => startChase(1), 1400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ── Reveal sub-phases ─────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== STAGE.REVEAL) return;
    setRevealPhase(0);
    const t1 = setTimeout(() => setRevealPhase(1), 60);
    const t2 = setTimeout(() => setRevealPhase(2), 900);
    const t3 = setTimeout(() => setRevealPhase(3), 1250);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stage]);

  // ── Screen shake ──────────────────────────────────────────────────────────
  const triggerShake = useCallback(() => {
    setShake(true);
    clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setShake(false), 500);
  }, []);

  // ── Start chase phase ─────────────────────────────────────────────────────
  const startChase = useCallback((phase) => {
    const count = osuCountRef.current;
    phaseRef.current = phase;
    missCountRef.current = 0;
    setMissCount(0);
    setStage(phase === 1 ? STAGE.CHASE_RIGHT : STAGE.CHASE_LEFT);
    setCircleIdx(0);
    setHitBurst(null);
    setCircleFlash(false);
    setCircles(Array.from({ length: count }, (_, i) => ({
      id: `${phase}-${i}`,
      x: 12 + Math.random() * 68,
      y: 18 + Math.random() * 58,
    })));
  }, []);

  // ── Approach ring ─────────────────────────────────────────────────────────
  useEffect(() => {
    const isChase = stage === STAGE.CHASE_RIGHT || stage === STAGE.CHASE_LEFT;
    if (!isChase) return;
    const count = osuCountRef.current;
    if (circleIdx >= count) return;

    const [baseStep] = getDiff();
    const step = phaseRef.current === 2 ? baseStep * 1.35 : baseStep;

    setCircleActive(true);
    setApproachScale(APPROACH_START);
    setHitBurst(null);
    setCircleFlash(false);

    let scale = APPROACH_START;
    let missedFired = false;
    shrinkRef.current = setInterval(() => {
      scale -= step;
      setApproachScale(Math.max(0, scale));

      // Fire the miss once ring passes the end of the hit window
      const [, hw3,,,escPer2] = getDiff();
      if (!missedFired && scale < (1 - hw3)) {
        missedFired = true;
        clearInterval(shrinkRef.current);
        missCountRef.current += 1;
        setMissCount(missCountRef.current);
        triggerShake();
        setCircles(prev => {
          const c = prev[circleIdx];
          if (c) setMissedCircle({ x: c.x, y: c.y, id: Date.now() });
          return prev;
        });
        setTimeout(() => setMissedCircle(null), 600);
        const esc = Math.max(0, (missCountRef.current - 1) * escPer2);
        if (Math.random() < esc) {
          setCircleActive(false);
          setStage(STAGE.ESCAPED);
        } else {
          setCircleActive(false);
          setCircleIdx(i => i + 1);
        }
      }
    }, APPROACH_MS);

    return () => clearInterval(shrinkRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleIdx, stage, triggerShake]);

  // ── Phase advance — single phase, go straight to REEL ────────────────────
  useEffect(() => {
    const count = osuCountRef.current;
    if (circleIdx < count) return;
    if (stage === STAGE.CHASE_RIGHT || stage === STAGE.CHASE_LEFT) {
      const t = setTimeout(() => {
        totalRotRef.current = 0; spinnerDegRef.current = 0;
        setReelFill(0); setSpinnerDeg(0); completedRef.current = false;
        setStage(STAGE.REEL);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [circleIdx, stage, startChase]);

  // ── Circle click ──────────────────────────────────────────────────────────
  const handleCircleClick = () => {
    const count = osuCountRef.current;
    if (!circleActive || circleIdx >= count) return;

    const [, hw,,,escPer] = getDiff();

    // Too early — ring is still way outside the window, ignore
    if (approachScale > (1 + hw)) return;

    clearInterval(shrinkRef.current);
    // Hit if within window on either side of the meeting point
    const isHit = approachScale >= (1 - hw);
    const c = circles[circleIdx];
    setHitBurst({ x: c.x, y: c.y, id: Date.now(), isHit });

    if (isHit) {
      setCircleActive(false);
      setCircleIdx(i => i + 1);
    } else {
      setCircleFlash(true);
      triggerShake();
      missCountRef.current += 1;
      setMissCount(missCountRef.current);
      const esc = Math.max(0, (missCountRef.current - 1) * escPer);
      setTimeout(() => setCircleFlash(false), 350);
      if (Math.random() < esc) {
        setTimeout(() => { setCircleActive(false); setStage(STAGE.ESCAPED); }, 350);
      } else {
        setTimeout(() => { setCircleActive(false); setCircleIdx(i => i + 1); }, 350);
      }
    }
  };

  // ── Reel ──────────────────────────────────────────────────────────────────
  const getAngle = (e, rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX ?? e.touches?.[0]?.clientX ?? cx) - cx;
    const dy = (e.clientY ?? e.touches?.[0]?.clientY ?? cy) - cy;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handleReelMove = useCallback((e) => {
    if (!spinning || !reelRef.current) return;
    const [,,,targetDeg] = getDiff();
    const rect  = reelRef.current.getBoundingClientRect();
    const angle = getAngle(e, rect);
    if (lastAngleRef.current !== null) {
      let delta = angle - lastAngleRef.current;
      if (delta > 180)  delta -= 360;
      if (delta < -180) delta += 360;
      totalRotRef.current   += Math.abs(delta);
      spinnerDegRef.current += delta;
      setSpinnerDeg(spinnerDegRef.current);
      const fill = Math.min(100, (totalRotRef.current / targetDeg) * 100);
      setReelFill(fill);
      if (fill >= 100 && !completedRef.current) {
        completedRef.current = true;
        setSpinning(false);
        setTimeout(() => setStage(STAGE.REVEAL), 500);
      }
    }
    lastAngleRef.current = angle;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const rarityColor = RARITY_COLORS[selectedRarity] || '#aaa';
  const rarityLabel = selectedRarity || 'COMMON';
  const fishName    = fishItem?.label || 'Unknown Fish';
  const fishDesc    = FISH_DESCRIPTIONS[fishName] || 'A mysterious creature from the deep.';
  const fishImage   = fishItem?.image || '/images/fish/Normal Ocean Fish (2).png';
  const isChase     = stage === STAGE.CHASE_RIGHT || stage === STAGE.CHASE_LEFT;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: stage === STAGE.REVEAL   ? 'transparent'
                : stage === STAGE.ESCAPED  ? 'linear-gradient(180deg,#1a0a00,#3a1800)'
                : 'linear-gradient(180deg,#0a1a3a 0%,#0d3060 40%,#0a4a6e 100%)',
      fontFamily: 'monospace', userSelect: 'none',
      animation: shake ? 'screenShake 0.45s ease-out' : 'none',
    }}>
      <style>{`
        @keyframes bubbleRise {
          0%   { transform:translateY(0) scale(1); opacity:.8; }
          100% { transform:translateY(-110vh) scale(.3); opacity:0; }
        }
        @keyframes fishSwimRight {
          0%   { transform:translateX(-250px); }
          100% { transform:translateX(115vw); }
        }
        @keyframes fishSwimLeft {
          0%   { transform:translateX(115vw); }
          100% { transform:translateX(-250px); }
        }
        @keyframes rarityPop {
          0%   { transform:translate(-50%,-50%) scale(0.6); opacity:0; }
          30%  { transform:translate(-50%,-50%) scale(1.1); opacity:1; }
          80%  { transform:translate(-50%,-50%) scale(1);   opacity:1; }
          100% { transform:translate(-50%,-50%) scale(0.9); opacity:0; }
        }
        @keyframes chaseRight { 0%{left:-15%;} 100%{left:110%;} }
        @keyframes chaseLeft  { 0%{right:-15%;} 100%{right:110%;} }
        @keyframes osuBurst {
          0%   { transform:translate(-50%,-50%) scale(1);   opacity:.9; }
          100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
        }
        @keyframes osuMiss {
          0%   { transform:translate(-50%,-50%) scale(1);   opacity:.8; }
          100% { transform:translate(-50%,-50%) scale(1.6); opacity:0; }
        }
        @keyframes screenShake {
          0%,100% { transform:translate(0,0) rotate(0); }
          15%     { transform:translate(-7px,3px) rotate(-.4deg); }
          30%     { transform:translate(7px,-4px) rotate(.4deg); }
          50%     { transform:translate(-5px,5px) rotate(-.25deg); }
          70%     { transform:translate(5px,-2px) rotate(.25deg); }
          85%     { transform:translate(-3px,2px) rotate(-.1deg); }
        }
        @keyframes spinnerGlow {
          0%,100% { box-shadow:0 0 20px rgba(100,200,255,.35); }
          50%     { box-shadow:0 0 70px rgba(100,200,255,.9),0 0 110px rgba(100,200,255,.25); }
        }
        @keyframes escapedPulse { 0%,100%{opacity:1;} 50%{opacity:.3;} }
        @keyframes fadeUp {
          0%   { opacity:0; transform:translateX(-50%) translateY(16px); }
          100% { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes waterRipple {
          0%   { transform:translateX(-50%) scaleX(.15); opacity:.7; }
          100% { transform:translateX(-50%) scaleX(1.5); opacity:0; }
        }
        @keyframes fishHover {
          0%,100% { filter: brightness(1.0); }
          50%     { filter: brightness(1.4); }
        }
        @keyframes waveRight {
          0%   { transform: translateX(-110vw); opacity:0.7; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform: translateX(110vw);  opacity:0.7; }
        }
        @keyframes waveLeft {
          0%   { transform: translateX(110vw);  opacity:0.7; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform: translateX(-110vw); opacity:0.7; }
        }
      `}</style>


      {/* ── UNDERWATER — swimming fish, click to choose ── */}
      {stage === STAGE.UNDERWATER && (
        <div style={{ position:'absolute', inset:0 }}>
          <p style={{
            position:'absolute', top:'8%', left:'50%', transform:'translateX(-50%)',
            color:'rgba(150,220,255,0.9)', fontSize:'18px',
            textAlign:'center', lineHeight:'1.6', margin:0,
            textShadow:'0 0 12px rgba(0,100,200,.6)',
          }}>
            Fish are passing by...<br/>
            <span style={{fontSize:'13px', opacity:.7}}>Click one to go after it!</span>
          </p>

          {uwFish.map(f => (
            <div
              key={f.id}
              onClick={handleFishClick}
              style={{
                position:'absolute',
                top:`${f.y}%`,
                left: 0,
                marginTop:`-${f.h / 2}px`,
                width:`${f.w}px`,
                height:`${f.h}px`,
                animation:`${f.dir === 'right' ? 'fishSwimRight' : 'fishSwimLeft'} ${f.duration}s linear ${f.delay}s infinite`,
                cursor:'pointer',
                zIndex:5,
              }}
            >
              <div style={{
                width:'100%', height:'100%',
                background:'radial-gradient(ellipse, rgba(5,18,50,.95) 25%, rgba(10,45,100,.12) 100%)',
                filter:`blur(${f.blur}px)`,
                borderRadius:'50%',
                transform: f.dir === 'left' ? 'scaleX(-1)' : 'none',
              }} />
            </div>
          ))}
        </div>
      )}

      {/* ── RARITY FLASH — shown after fish clicked, before chase ── */}
      {stage === STAGE.RARITY_FLASH && (
        <div style={{ position:'absolute', inset:0 }}>
          {/* Background flash tinted with rarity color */}
          <div style={{
            position:'absolute', inset:0,
            background:`radial-gradient(ellipse at center, ${rarityColor}22 0%, transparent 70%)`,
          }} />
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            animation:'rarityPop 1.4s ease-out forwards',
            textAlign:'center',
          }}>
            <div style={{
              fontSize:'48px', fontWeight:'bold',
              color: rarityColor,
              textShadow:`0 0 30px ${rarityColor}, 0 0 60px ${rarityColor}88`,
              letterSpacing:'4px',
              marginBottom:'10px',
            }}>{rarityLabel}</div>
            <div style={{ color:'rgba(255,255,255,.7)', fontSize:'16px' }}>
              fish is on the line!
            </div>
          </div>
        </div>
      )}

      {/* ── CHASE ── */}
      {isChase && (
        <div style={{ width:'100%', height:'100%', position:'relative' }}>


          <div style={{
            position:'absolute', top:'16px', left:'50%', transform:'translateX(-50%)',
            color:'#fff', fontSize:'14px', textAlign:'center', lineHeight:'1.7',
          }}>
            Click in time!
            &nbsp;|&nbsp;{circleIdx}/{osuCountRef.current}
            {missCount > 0 && (
              <span style={{color:'#ff6644', marginLeft:'12px'}}>
                ⚠ {missCount} miss{missCount > 1 ? 'es' : ''}
                {missCount >= 2 && ' — fish escaping!'}
              </span>
            )}
          </div>

          {/* Blurred fish shadow — follows current circle */}
          {circles.length > 0 && (() => {
            const fc = circles[Math.min(circleIdx, circles.length - 1)];
            return (
              <div style={{
                position:'absolute',
                left:`${fc.x}%`, top:`${fc.y}%`,
                transform:'translate(-50%,-50%)',
                transition:'left 0.28s cubic-bezier(.25,.8,.25,1), top 0.28s cubic-bezier(.25,.8,.25,1)',
                width:'200px', height:'110px',
                background:'radial-gradient(ellipse, rgba(0,20,60,.98) 20%, rgba(0,60,140,.55) 55%, rgba(0,35,75,.08) 100%)',
                filter:'blur(8px)',
                borderRadius:'50%',
                zIndex:5,
                pointerEvents:'none',
                boxShadow:'0 0 30px 10px rgba(0,40,120,.35)',
              }} />
            );
          })()}

          {/* osu circles */}
          {circles.map((c, i) => {
            const isCurrent = i === circleIdx && circleActive;
            const isNext    = i === circleIdx + 1 && circleActive;
            if (!isCurrent && !isNext) return null;
            const OUTER = 180; // target ring — approach ring lines up here
            const INNER = 120;  // inner filled circle
            const flashing = isCurrent && circleFlash;
            const borderCol = flashing ? '#ff3333' : isCurrent ? '#ffff64' : 'rgba(255,255,100,.22)';
            return (
              <div key={c.id} style={{ position:'absolute', left:`${c.x}%`, top:`${c.y}%` }}>

                {/* Outer target ring — approach ring must line up here */}
                <div
                  onClick={isCurrent ? handleCircleClick : undefined}
                  style={{
                    position:'absolute', transform:'translate(-50%,-50%)',
                    width:`${OUTER}px`, height:`${OUTER}px`, borderRadius:'50%',
                    border:`3px solid ${borderCol}`,
                    background: flashing ? 'rgba(255,50,50,.4)' : isCurrent ? 'rgba(255,255,100,.25)' : 'rgba(255,255,100,.06)',
                    cursor: isCurrent ? 'pointer' : 'default',
                    zIndex: isCurrent ? 12 : 8, boxSizing:'border-box',
                    boxShadow: flashing ? '0 0 22px rgba(255,50,50,.7)' : isCurrent ? '0 0 12px rgba(255,255,100,.3)' : 'none',
                    transition:'border-color .08s',
                  }}
                />

                {/* Inner circle */}
                <div style={{
                  position:'absolute', transform:'translate(-50%,-50%)',
                  width:`${INNER}px`, height:`${INNER}px`, borderRadius:'50%',
                  border:`3px solid ${borderCol}`,
                  background: flashing ? 'rgba(255,50,50,.7)' : 'rgba(10,30,60,.92)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: borderCol, fontSize:'18px', fontWeight:'bold',
                  zIndex: isCurrent ? 12 : 8, boxSizing:'border-box',
                  pointerEvents:'none',
                }}>{i + 1}</div>

                {/* Approach ring — shrinks toward OUTER */}
                {isCurrent && !circleFlash && (
                  <div style={{
                    position:'absolute',
                    transform:`translate(-50%,-50%) scale(${approachScale})`,
                    width:`${OUTER}px`, height:`${OUTER}px`, borderRadius:'50%',
                    border:'2px solid rgba(255,255,100,.95)',
                    background:'transparent', pointerEvents:'none',
                    zIndex:11, boxSizing:'border-box',
                  }} />
                )}
              </div>
            );
          })}

          {/* Hit/miss burst */}
          {hitBurst && (
            <div key={hitBurst.id} style={{
              position:'absolute', left:`${hitBurst.x}%`, top:`${hitBurst.y}%`,
              width:'180px', height:'180px', borderRadius:'50%',
              border:`4px solid ${hitBurst.isHit ? '#ffff64' : '#ff3333'}`,
              background: hitBurst.isHit ? 'rgba(255,255,100,.25)' : 'rgba(255,50,50,.2)',
              animation:`${hitBurst.isHit ? 'osuBurst' : 'osuMiss'} .4s ease-out forwards`,
              pointerEvents:'none', zIndex:13,
            }} />
          )}

          {/* X on timeout miss */}
          {missedCircle && (
            <div key={missedCircle.id} style={{
              position:'absolute', left:`${missedCircle.x}%`, top:`${missedCircle.y}%`,
              transform:'translate(-50%,-50%)',
              fontSize:'72px', fontWeight:'900', color:'#ff2222',
              textShadow:'0 0 18px #ff0000, 0 0 4px #000',
              animation:'osuMiss .6s ease-out forwards',
              pointerEvents:'none', zIndex:14, lineHeight:1,
            }}>✕</div>
          )}
        </div>
      )}

      {/* ── REEL ── */}
      {stage === STAGE.REEL && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'24px' }}>
          <p style={{
            color:'#aef', fontSize:'26px', fontWeight:'bold',
            letterSpacing:'6px', textShadow:'0 0 24px rgba(100,200,255,.95)', margin:0,
          }}>SPIN!</p>

          <div
            ref={reelRef}
            onMouseDown={e => { setSpinning(true); lastAngleRef.current = getAngle(e, reelRef.current.getBoundingClientRect()); }}
            onMouseMove={handleReelMove}
            onMouseUp={() => { setSpinning(false); lastAngleRef.current = null; }}
            onMouseLeave={() => { setSpinning(false); lastAngleRef.current = null; }}
            onTouchStart={e => { setSpinning(true); lastAngleRef.current = getAngle(e, reelRef.current.getBoundingClientRect()); }}
            onTouchMove={handleReelMove}
            onTouchEnd={() => { setSpinning(false); lastAngleRef.current = null; }}
            style={{ position:'relative', width:`${SPINNER_SIZE}px`, height:`${SPINNER_SIZE}px`, cursor:'crosshair' }}
          >
            <div style={{
              position:'absolute', inset:0, borderRadius:'50%',
              background:`conic-gradient(rgba(100,200,255,.95) ${reelFill*3.6}deg, rgba(12,30,68,.88) ${reelFill*3.6}deg)`,
              animation: spinning ? 'spinnerGlow .5s ease-in-out infinite' : 'none',
            }} />
            <div style={{ position:'absolute', inset:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#0a1a3a,#0d3060)' }} />
            <div style={{
              position:'absolute', inset:'75px', borderRadius:'50%',
              border:'2px solid rgba(100,200,255,.28)',
              transform:`rotate(${spinnerDeg}deg)`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {[0,45,90,135].map(a => (
                <div key={a} style={{
                  position:'absolute', width:'100%', height:'2px',
                  background:`linear-gradient(90deg,transparent,rgba(100,200,255,${a%90===0?.6:.28}),transparent)`,
                  transform:`rotate(${a}deg)`,
                }} />
              ))}
            </div>
            <div style={{
              position:'absolute', inset:'185px', borderRadius:'50%',
              background: spinning ? 'rgba(100,200,255,.15)' : 'rgba(10,26,58,.9)',
              border:'2px solid rgba(100,200,255,.5)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#aef', fontSize:'20px', fontWeight:'bold', transition:'background .1s',
            }}>{Math.round(reelFill)}%</div>
          </div>

          <div style={{
            width:`${Math.min(SPINNER_SIZE, 500)}px`, height:'10px',
            background:'rgba(255,255,255,.07)', borderRadius:'5px',
            overflow:'hidden', border:'1px solid rgba(100,200,255,.28)',
          }}>
            <div style={{ width:`${reelFill}%`, height:'100%', background:'linear-gradient(90deg,#4488ff,#00ffcc)', transition:'width .04s' }} />
          </div>
          <span style={{color:'rgba(150,200,255,.5)', fontSize:'13px'}}>Hold &amp; spin around the reel</span>
        </div>
      )}

      {/* ── REVEAL ── */}
      {stage === STAGE.REVEAL && (
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', background:'linear-gradient(180deg,#5ab8f5,#99d4ef 65%,#c0e8f8)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(180deg,#1a6d9e,#0d4a72 40%,#07283f)' }} />
          <div style={{ position:'absolute', top:'50%', left:0, right:0, height:'5px', marginTop:'-2px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,.7) 30%,rgba(200,240,255,.9) 50%,rgba(255,255,255,.7) 70%,transparent)' }} />
          {[0,.45,.9].map((d,i) => (
            <div key={i} style={{
              position:'absolute', top:'50%', left:'50%',
              width:`${150+i*55}px`, height:'12px', marginTop:'-6px',
              borderRadius:'50%', border:'2px solid rgba(255,255,255,.4)',
              animation:`waterRipple 1.8s ease-out ${d}s infinite`,
            }} />
          ))}

          <div style={{
            position:'absolute', left:'50%', top:'34%',
            transform: revealPhase >= 1 ? 'translate(-50%,-50%)' : 'translate(-50%, calc(-50% + 320px))',
            transition: revealPhase >= 1 ? 'transform .82s cubic-bezier(.08,.7,.2,1)' : 'none',
            zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
          }}>
            <div style={{
              color:'#fff', fontSize:'22px', fontWeight:'bold',
              textShadow:'0 2px 12px rgba(0,0,0,.6)',
              opacity: revealPhase >= 2 ? 1 : 0, transition:'opacity .4s ease-out', textAlign:'center',
            }}>{fishName}</div>
            {fishWeight != null && (
              <div style={{
                color:'#a0d8ef', fontSize:'14px',
                opacity: revealPhase >= 2 ? 1 : 0, transition:'opacity .4s ease-out .1s', textAlign:'center',
                marginTop:'-6px',
              }}>{fishWeight} kg</div>
            )}

            <div style={{ display:'flex', alignItems:'flex-start', gap:'18px' }}>
              <img
                src={fishImage} alt={fishName}
                style={{
                  width:'180px', height:'180px', objectFit:'contain',
                  filter: revealPhase >= 2 ? 'none' : 'blur(22px) grayscale(1) brightness(0.3)',
                  transition:'filter .55s ease-out', flexShrink:0, borderRadius:'10px',
                }}
                onError={e => { e.target.src = '/images/fish/Normal Ocean Fish (2).png'; }}
              />
              <div style={{
                width:'210px',
                background:'rgba(0,0,0,.55)', backdropFilter:'blur(10px)',
                border:`2px solid ${rarityColor}`,
                borderRadius:'12px', padding:'14px 16px',
                display:'flex', flexDirection:'column', gap:'10px',
                opacity: revealPhase >= 3 ? 1 : 0, transition:'opacity .35s ease-out',
              }}>
                <div style={{
                  display:'inline-block', padding:'3px 12px', borderRadius:'16px',
                  background:rarityColor, color:'#000', fontWeight:'bold', fontSize:'12px', alignSelf:'flex-start',
                }}>{rarityLabel}</div>
                <div style={{ color:'#ccc', fontSize:'13px', lineHeight:'1.55' }}>{fishDesc}</div>
                <button
                  onClick={() => { if (collectClicked) return; setCollectClicked(true); onComplete(); }}
                  style={{
                    marginTop:'4px', padding:'9px 0',
                    background: collectClicked ? 'rgba(255,255,255,.1)' : rarityColor,
                    border:'none', borderRadius:'8px',
                    color: collectClicked ? '#888' : '#000',
                    fontWeight:'bold', fontSize:'15px',
                    cursor: collectClicked ? 'default' : 'pointer',
                    fontFamily:'monospace',
                    boxShadow: collectClicked ? 'none' : `0 3px 10px ${rarityColor}77`,
                    transition:'all .2s',
                  }}
                >{collectClicked ? 'Reeling in...' : 'Collect!'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ESCAPED ── */}
      {stage === STAGE.ESCAPED && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'20px', textAlign:'center' }}>
          <div style={{fontSize:'72px', animation:'escapedPulse 1s ease-in-out 3'}}>🐟</div>
          <div style={{ color:'#ff6644', fontSize:'32px', fontWeight:'bold', textShadow:'0 0 20px rgba(255,100,60,.6)' }}>
            The fish got away!
          </div>
          <div style={{color:'#aa8866', fontSize:'14px', maxWidth:'260px'}}>
            You missed too many times and the fish broke free.
          </div>
          <button onClick={onEscape} style={{
            marginTop:'12px', padding:'12px 32px',
            background:'rgba(255,255,255,.08)', border:'2px solid rgba(255,150,100,.5)',
            borderRadius:'10px', color:'#ffaa88', fontWeight:'bold', fontSize:'16px',
            cursor:'pointer', fontFamily:'monospace',
          }}>Back to Menu</button>
        </div>
      )}
    </div>
  );
};

export default FishingMiniGame;
