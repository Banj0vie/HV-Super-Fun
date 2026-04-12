import React, { useState, useEffect } from "react";
import PanZoomViewport from "../layouts/PanZoomViewport";
import { MARKET_VIEWPORT, MARKET_HOTSPOTS, MARKET_BEES, MARKET_STUFFS } from "../constants/scene_market";
import DexDialog from "../containers/Market_Dex";
import VendorDialog from "../containers/Market_Vendor";
import BankerDialog from "../containers/Market_Banker";
import { ID_MARKET_HOTSPOTS, ID_PRODUCE_ITEMS, ID_SEEDS, ID_POTION_ITEMS } from "../constants/app_ids";
import MarketPlaceDialog from "../containers/Market_Marketplace";
import LeaderboardDialog from "../containers/Market_Leaderboard";
import SageDialog from "../containers/Market_Sage";
import AdminPanel from "./index";
import WeatherOverlay from "../components/WeatherOverlay";
import Shop from "../containers/Shop";
import BaseDialog from "../containers/_BaseDialog";
import BaseButton from "../components/buttons/BaseButton";
import { useNotification } from "../contexts/NotificationContext";
import { useItems } from "../hooks/useItems";

const Market = () => {
  const { width, height } = MARKET_VIEWPORT;
  const hotspots = MARKET_HOTSPOTS;
  const { refetch } = useItems();
  const [tutorialStep, setTutorialStep] = useState(() => parseInt(localStorage.getItem('sandbox_tutorial_step') || '0', 10));
  const [showShop, setShowShop] = useState(false);
  const [tutMarketPage, setTutMarketPage] = useState(() => localStorage.getItem('sandbox_tut_market') === 'true' ? 11 : 0);

  useEffect(() => {
    if (tutorialStep === 10) {
      setTutorialStep(11);
      localStorage.setItem('sandbox_tutorial_step', '11');
    }
    
    const stepHandler = () => setTutorialStep(parseInt(localStorage.getItem('sandbox_tutorial_step') || '0', 10));
    window.addEventListener('tutorialStepChanged', stepHandler);
    return () => {
      window.removeEventListener('tutorialStepChanged', stepHandler);
    };
  }, [tutorialStep]);

  // Sync tutMarketPage to localStorage so index.jsx can react
  useEffect(() => {
    localStorage.setItem('sandbox_tut_market_page', String(tutMarketPage));
    window.dispatchEvent(new CustomEvent('tutMarketPageChanged'));
  }, [tutMarketPage]);

  // When tutMarketPage 16: clicking the dock ends the tutorial
  useEffect(() => {
    if (tutMarketPage !== 16) return;
    const handler = (e) => {
      if (e.target.closest('a[href*="/house"]')) {
        localStorage.setItem('sandbox_tutorial_step', '32');
        localStorage.removeItem('sandbox_tut_market');
        setTutMarketPage(0);
        window.dispatchEvent(new CustomEvent('tutorialStepChanged'));
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [tutMarketPage]);

  const NEXT_STEP_MAP = { 11: 13, 13: 14, 14: 15, 15: 16, 16: 12, 12: 17 };

  const advanceTutorial = () => {
    const nextStep = NEXT_STEP_MAP[tutorialStep] ?? tutorialStep + 1;
    setTutorialStep(nextStep);
    localStorage.setItem('sandbox_tutorial_step', nextStep.toString());
  };

  const getActiveHotspots = () => {
    if (tutorialStep >= 32) return hotspots;
    const makeDummy = (arr) => arr.map(h => ({ ...h, id: h.id + '_dummy' }));
    // New tutMarketPage flow (tutorialStep === 3)
    if (tutMarketPage === 12) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.BANKER));
    if (tutMarketPage === 13) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.VENDOR));
    if (tutMarketPage === 14) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.MARKET));
    if (tutMarketPage === 15) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.SAGE));
    // Legacy tutorialStep flow
    if (tutorialStep === 11) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.DEX));
    if (tutorialStep === 13) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.MARKET));
    if (tutorialStep === 14) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.SAGE));
    if (tutorialStep === 15) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.LEADERBOARD));
    if (tutorialStep === 16) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.BANKER));
    if (tutorialStep === 12) return makeDummy(hotspots.filter(h => h.id === ID_MARKET_HOTSPOTS.VENDOR));
    return [];
  };

  const dialogs = [
    {
      id: ID_MARKET_HOTSPOTS.DEX,
      component: DexDialog,
      label: "EXCHANGE TOKENS",
      header: "/images/dialog/modal-header-dex.png",
    },
    {
      id: ID_MARKET_HOTSPOTS.VENDOR,
      component: VendorDialog,
      label: "VENDOR",
      header: "/images/dialog/modal-header-vendor.png",
      headerOffset: 10,
    },
    {
      id: ID_MARKET_HOTSPOTS.BANKER,
      component: BankerDialog,
      label: "BANKER",
      header: "/images/dialog/modal-header-dex.png",
    },
    {
      id: ID_MARKET_HOTSPOTS.MARKET,
      component: MarketPlaceDialog,
      label: "MARKETPLACE",
      header: "/images/dialog/modal-header-vendor.png",
      headerOffset: 10,
    },
    {
      id: ID_MARKET_HOTSPOTS.LEADERBOARD,
      component: LeaderboardDialog,
      label: "LEADERBOARD",
      header: "/images/dialog/modal-header-leaderboard.png",
      headerOffset: 22,
    },
    {
      id: ID_MARKET_HOTSPOTS.SAGE,
      component: SageDialog,
      label: "QUEEN",
      header: "/images/dialog/modal-header-queen.png",
      headerOffset: 10,
    },
  ];
  const bees = MARKET_BEES;
  return (
    <>
      <WeatherOverlay />
      <PanZoomViewport
        backgroundSrc="/images/backgrounds/market.webp"
        hotspots={getActiveHotspots()}
        dialogs={tutorialStep >= 32 ? dialogs : []}
        width={width}
        height={height}
        stuffs={MARKET_STUFFS}
        bees={bees}
        initialScale={1.3}
        disablePanZoom
        onHotspotClick={(id) => {
          if (id === ID_MARKET_HOTSPOTS.BANKER) {
            setShowShop(true);
            return true;
          }
          return false;
        }}
      />
      {showShop && <Shop onClose={() => setShowShop(false)} />}
      
      <AdminPanel />

      {tutorialStep >= 11 && tutorialStep <= 17 && (
        <>
          <style>{`
            a[href*="/farm"], a[href*="/house"], a[href*="/valley"], a[href*="/market"], a[href*="/tavern"] { pointer-events: none !important; }
            div[title], button[title], .hotspot, .map-btn { pointer-events: none !important; }
            @keyframes marketHighlightBox { 0%, 100% { box-shadow: 0 0 20px 5px #00ff41; background-color: rgba(0, 255, 65, 0.2); } 50% { box-shadow: 0 0 5px 2px #00ff41; background-color: transparent; } }
            @keyframes mapIconHighlight { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1); } }
            ${tutorialStep === 11 ? `div[title*="EXCHANGE" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; }` : ''}
            ${tutorialStep === 13 ? `div[title*="MARKET" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; }` : ''}
            ${tutorialStep === 14 ? `div[title*="QUEEN" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; }` : ''}
            ${tutorialStep === 15 ? `div[title*="LEADERBOARD" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; }` : ''}
            ${tutorialStep === 16 ? `div[title*="BANKER" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; }` : ''}
            ${tutorialStep === 12 ? `div[title*="VENDOR" i], div[title*="SEED" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; }` : ''}
            ${tutorialStep === 17 ? `a[href*="/house"], img[src*="house" i] { animation: mapIconHighlight 1.5s infinite !important; position: relative; z-index: 100001; pointer-events: auto !important; }` : ''}
          `}</style>
          <div style={{ position: 'fixed', right: '0px', bottom: '0px', zIndex: 100000 }}>
            <div style={{ position: 'relative', width: '666px' }}>
              <img src="/images/tutorial/sirbeetextbox.png" alt="Tutorial" style={{ width: '666px', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: 'calc(10% + 45px)', left: '22%', right: '10%', bottom: '22%', display: 'flex', alignItems: 'flex-start' }}>
                {tutorialStep === 11 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    Welcome to the Town Market! First, you'll need some Honey to buy things. Click on the DEX to exchange your tokens for Honey!
                  </p>
                )}
              </div>
              {tutorialStep === 11 && (
                <div style={{ position: 'absolute', bottom: '13%', left: '22%', right: '5%' }}>
                  <div
                    style={{ position: 'relative', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.1s, filter 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; e.currentTarget.style.filter = 'brightness(0.85)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
                    onClick={advanceTutorial}
                  >
                    <img src="/images/tutorial/tutbluebar.png" alt="" style={{ width: '100%', display: 'block' }} draggable={false} />
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Cartoonist', fontSize: '14px', color: '#fff', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000', whiteSpace: 'nowrap', pointerEvents: 'none' }}>NEXT!</span>
                  </div>
                </div>
              )}
              <div style={{ position: 'absolute', top: 'calc(10% + 45px)', left: '22%', right: '10%', bottom: '22%', display: tutorialStep === 11 ? 'none' : 'flex', alignItems: 'flex-start' }}>
                {tutorialStep === 12 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    Finally, to wrap things up here is the Vendor! You can buy Seed Packs to plant on your farm.
                  </p>
                )}
                {tutorialStep === 13 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    This is the Marketplace. You can trade items with other players here!
                  </p>
                )}
                {tutorialStep === 14 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    That's the Queen Sage. She can help you upgrade your Worker Bees!
                  </p>
                )}
                {tutorialStep === 15 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    Check the Leaderboard to see who the top farmers are!
                  </p>
                )}
                {tutorialStep === 16 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    The Banker can securely store your tokens.
                  </p>
                )}
                {tutorialStep === 17 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    Now, let's head to your House! Click the House icon on the map.
                  </p>
                )}
              </div>
              {[12, 13, 14, 15, 16].includes(tutorialStep) && (
                <div style={{ position: 'absolute', bottom: '13%', left: '22%', right: '5%' }}>
                  <div
                    style={{ position: 'relative', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.1s, filter 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; e.currentTarget.style.filter = 'brightness(0.85)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.filter = 'brightness(1.2)'; }}
                    onClick={advanceTutorial}
                  >
                    <img src="/images/tutorial/tutbluebar.png" alt="" style={{ width: '100%', display: 'block' }} draggable={false} />
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Cartoonist', fontSize: '14px', color: '#fff', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000', whiteSpace: 'nowrap', pointerEvents: 'none' }}>NEXT!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* New market tutorial flow: pages 11–15 with images + labels, page 16 with dock pulse */}
      {tutMarketPage >= 11 && tutMarketPage <= 15 && (
        <>
          <style>{`
            .tut-arrow { position: absolute; right: -22px; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; background: #f5c842; border: 3px solid #a67c00; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 22px; box-shadow: 0 3px 10px rgba(0,0,0,0.4); transition: transform 0.1s, filter 0.1s; user-select: none; }
            .tut-arrow:hover { filter: brightness(1.2); transform: translateY(-50%) scale(1.1); }
            .tut-arrow:active { filter: brightness(0.85); transform: translateY(-50%) scale(0.95); }
            a[href*="/farm"], a[href*="/house"], a[href*="/valley"], a[href*="/market"], a[href*="/tavern"] { pointer-events: none !important; }
            @keyframes marketHighlightBox { 0%, 100% { box-shadow: 0 0 20px 5px #f5c842; background-color: rgba(245,200,66,0.2); } 50% { box-shadow: 0 0 5px 2px #f5c842; background-color: transparent; } }
            ${tutMarketPage === 12 ? `div[title*="BANKER" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; pointer-events: none; }` : ''}
            ${tutMarketPage === 13 ? `div[title*="VENDOR" i], div[title*="SEED" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; pointer-events: none; }` : ''}
            ${tutMarketPage === 14 ? `div[title*="MARKET" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; pointer-events: none; }` : ''}
            ${tutMarketPage === 15 ? `div[title*="QUEEN" i] { animation: marketHighlightBox 1.5s infinite !important; border-radius: 12px; pointer-events: none; }` : ''}
          `}</style>
          <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 100000 }}>
            <div style={{ position: 'relative', width: '400px' }}>
              <img
                src={`/images/tutorial/tutp${tutMarketPage}.png`}
                alt="Tutorial"
                style={{ width: '400px', objectFit: 'contain', display: 'block' }}
              />
              <div
                className="tut-arrow"
                onClick={() => setTutMarketPage(prev => prev + 1)}
              >▶</div>
            </div>
          </div>
        </>
      )}

      {tutMarketPage === 16 && (
        <style>{`
          a[href*="/farm"], a[href*="/market"], a[href*="/valley"], a[href*="/tavern"] { pointer-events: none !important; }
          a[href*="/house"] { display: block !important; pointer-events: auto !important; animation: dockIconPulse 1.2s ease-in-out infinite !important; transform-origin: center; position: relative; z-index: 100001; }
          @keyframes dockIconPulse { 0%, 100% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(255,215,0,0.9)); } 50% { transform: scale(0.95); filter: drop-shadow(0 0 2px rgba(255,215,0,0.3)); } }
        `}</style>
      )}
    </>
  );
};

export default Market;
