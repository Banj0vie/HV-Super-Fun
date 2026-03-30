import React, { useState, useEffect } from "react";
import PanZoomViewport from "../layouts/PanZoomViewport";
import { VALLEY_HOTSPOTS, VALLEY_VIEWPORT } from "../constants/scene_valley";
import AdminPanel from "./index";
import WeatherOverlay from "../components/WeatherOverlay";

const Valley = () => {
  const { width, height } = VALLEY_VIEWPORT;
  const hotspots = VALLEY_HOTSPOTS;
  const [tutorialStep, setTutorialStep] = useState(() => parseInt(localStorage.getItem('sandbox_tutorial_step') || '0', 10));

  useEffect(() => {
    const stepHandler = () => setTutorialStep(parseInt(localStorage.getItem('sandbox_tutorial_step') || '0', 10));
    window.addEventListener('tutorialStepChanged', stepHandler);
    return () => window.removeEventListener('tutorialStepChanged', stepHandler);
  }, []);

  const advanceTutorial = () => {
    const nextStep = tutorialStep + 1;
    setTutorialStep(nextStep);
    localStorage.setItem('sandbox_tutorial_step', nextStep.toString());
  };

  return (
    <>
      <WeatherOverlay />
      <PanZoomViewport
        backgroundSrc="/images/backgrounds/valley.webp"
        hotspots={hotspots}
        dialogs={[]}
        width={width}
        height={height}
        isBig
        initialScale={Math.min(window.innerWidth / width, window.innerHeight / height)}
      />
      <AdminPanel />

      {(tutorialStep === 25 || tutorialStep === 26) && (
        <>
          <style>{`
            a[href*="/farm"], a[href*="/house"], a[href*="/valley"], a[href*="/market"], a[href*="/tavern"] { pointer-events: none !important; }
            @keyframes farmIconPulse { 0%, 100% { transform: scale(1.1); } 50% { transform: scale(1); } }
            ${tutorialStep === 26 ? `a[href*="/farm"] { animation: farmIconPulse 1.5s infinite !important; position: relative; z-index: 100001; pointer-events: auto !important; }` : ''}
          `}</style>
          <div style={{ position: 'fixed', right: '0px', bottom: '0px', zIndex: 100000 }}>
            <div style={{ position: 'relative', width: '666px' }}>
              <img src="/images/tutorial/sirbeetextbox.png" alt="Tutorial" style={{ width: '666px', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: 'calc(10% + 45px)', left: '22%', right: '10%', bottom: '22%', display: 'flex', alignItems: 'flex-start' }}>
                {tutorialStep === 25 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    Now lets get a good look of the whole valley! This is where you can see everything — your farm, the market, the tavern, and all the other locations spread across the land.
                  </p>
                )}
                {tutorialStep === 26 && (
                  <p style={{ fontFamily: 'Cartoonist', fontSize: '11px', color: '#3b1f0a', lineHeight: '1.5', margin: 0 }}>
                    Alright now lets go learn how to craft, gather resources and more!
                  </p>
                )}
              </div>
              {tutorialStep === 25 && (
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
    </>
  );
};

export default Valley;
