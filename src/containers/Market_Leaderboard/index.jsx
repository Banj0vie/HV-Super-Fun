import React, { useState, useEffect } from "react";

const MOCK_BEST_FARMER = [
  { rank: 1, name: 'FarmKing99',    pts: '284,500' },
  { rank: 2, name: 'HarvestMoon',   pts: '196,000' },
  { rank: 3, name: 'GoldenRow',     pts: '118,200' },
];

const MOCK_HEAVIEST_POTATO = [
  { rank: 1, name: 'CornQueen',   kg: '69', emoji: <img src="/images/leaderboard/potato.png" alt="potato" style={{ width: '1.8vmin', height: '1.8vmin', objectFit: 'contain', verticalAlign: 'middle', position: 'relative', top: '-1.6px' }} /> },
  { rank: 2, name: 'PlowMaster',  kg: '67', emoji: <img src="/images/leaderboard/potato.png" alt="potato" style={{ width: '1.8vmin', height: '1.8vmin', objectFit: 'contain', verticalAlign: 'middle', position: 'relative', top: '-1.6px' }} /> },
  { rank: 3, name: 'BumperCrop',  kg: '62', emoji: <img src="/images/leaderboard/potato.png" alt="potato" style={{ width: '1.8vmin', height: '1.8vmin', objectFit: 'contain', verticalAlign: 'middle', position: 'relative', top: '-1.6px' }} /> },
];

const ROW_STYLE = {
  position: 'absolute',
  left: '14%',
  right: '14%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: 'GROBOLD, Cartoonist, monospace',
  pointerEvents: 'none',
};

const LeaderboardDialog = ({ onClose }) => {
  const [farmPts, setFarmPts] = useState(0);

  useEffect(() => {
    setFarmPts(parseInt(localStorage.getItem('sandbox_farming_points') || '0', 10));
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={onClose}
    >
      <div
        style={{ position: 'relative', display: 'inline-block' }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src="/images/leaderboard/leaderboardpotato.png"
          alt="Leaderboard"
          style={{ display: 'block', maxHeight: '90vh', maxWidth: '90vw' }}
        />

        {/* X button */}
        <img
          src="/images/leaderboard/x.png"
          alt="Close"
          onClick={onClose}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.filter = 'brightness(1.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.9)'; e.currentTarget.style.filter = 'brightness(0.8)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.filter = 'brightness(1.25)'; }}
          style={{
            position: 'absolute',
            top: 58,
            right: -19,
            width: 60,
            height: 60,
            cursor: 'pointer',
            objectFit: 'contain',
            pointerEvents: 'auto',
            transition: 'transform 0.1s, filter 0.1s',
          }}
        />

        {/* BEST FARMER rows — tops: r1=34.2, r2=40.8, r3=46.9 (up 3) */}
        {[34.2, 40.8, 46.9].map((top, i) => (
          <div key={i} style={{ ...ROW_STYLE, top: `${top}%` }}>
            <span style={{ fontSize: '1.8vmin', color: '#3b1f0a', fontWeight: 'bold' }}>
              {MOCK_BEST_FARMER[i].rank}&nbsp;&nbsp;{MOCK_BEST_FARMER[i].name}
            </span>
            <span style={{ fontSize: '1.8vmin', color: '#3b1f0a', fontWeight: 'bold' }}>
              {MOCK_BEST_FARMER[i].pts} PTS
            </span>
          </div>
        ))}

        {/* You — Best Farmer */}
        <div style={{ ...ROW_STYLE, top: '52.5%' }}>
          <span style={{ fontSize: '1.8vmin', color: '#f5d87a', fontWeight: 'bold' }}>
            5&nbsp;&nbsp;You
          </span>
          <span style={{ fontSize: '1.8vmin', color: '#f5d87a', fontWeight: 'bold' }}>
            {farmPts.toLocaleString()} PTS
          </span>
        </div>

        {/* HEAVIEST POTATO rows */}
        {[66.5, 72.6, 78.5].map((top, i) => (
          <div key={i} style={{ ...ROW_STYLE, top: `${top}%` }}>
            <span style={{ fontSize: '1.8vmin', color: '#3b1f0a', fontWeight: 'bold' }}>
              {MOCK_HEAVIEST_POTATO[i].rank}&nbsp;&nbsp;{MOCK_HEAVIEST_POTATO[i].name}
            </span>
            <span style={{ fontSize: '1.8vmin', color: '#3b1f0a', fontWeight: 'bold' }}>
              {MOCK_HEAVIEST_POTATO[i].kg} KG {MOCK_HEAVIEST_POTATO[i].emoji}
            </span>
          </div>
        ))}

        {/* You — Heaviest Potato */}
        <div style={{ ...ROW_STYLE, top: '84.4%' }}>
          <span style={{ fontSize: '1.8vmin', color: '#f5d87a', fontWeight: 'bold' }}>
            27&nbsp;&nbsp;You
          </span>
          <span style={{ fontSize: '1.8vmin', color: '#f5d87a', fontWeight: 'bold' }}>
            — KG <img src="/images/leaderboard/potato.png" alt="potato" style={{ width: '1.8vmin', height: '1.8vmin', objectFit: 'contain', verticalAlign: 'middle', position: 'relative', top: '-1.6px' }} />
          </span>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardDialog;
