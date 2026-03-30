import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * PanZoomViewport
 * - Drag (mouse/touch) to pan the content
 * - Scroll wheel to zoom in/out, centered around the cursor
 * - Double-click to reset
 */
export default function PanZoomViewport() {
  // subtle bobbing animation CSS injected locally
  const buttonAnimCss = `
    @keyframes mapFloat { 0% { transform: translateY(0); } 50% { transform: translateY(-4px); } 100% { transform: translateY(0); } }
    .map-btn { animation: mapFloat 1.8s ease-in-out infinite; will-change: transform; }
  `;
  const containerRef = useRef(null);

  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);

  const panState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
  });

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const setScaleAroundPoint = useCallback(
    (nextScale, clientX, clientY) => {
      const el = containerRef.current;
      if (!el) {
        setScale(nextScale);
        return;
      }
      const rect = el.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;

      const s = scale;
      const sPrime = nextScale;
      const newTx = px - (sPrime / s) * (px - tx);
      const newTy = py - (sPrime / s) * (py - ty);

      setTx(newTx);
      setTy(newTy);
      setScale(sPrime);
    },
    [scale, tx, ty]
  );

  const onWheel = (e) => {
    e.preventDefault();
    const zoomIntensity = 0.0012;
    const factor = Math.exp(-e.deltaY * zoomIntensity);
    const desired = clamp(scale * factor, 0.2, 6);
    setScaleAroundPoint(desired, e.clientX, e.clientY);
  };

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget?.setPointerCapture?.(e.pointerId);
    panState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startTx: tx,
      startTy: ty,
    };
  };

  const onPointerMove = (e) => {
    if (!panState.current.active) return;
    const dx = e.clientX - panState.current.startX;
    const dy = e.clientY - panState.current.startY;
    setTx(panState.current.startTx + dx);
    setTy(panState.current.startTy + dy);
  };

  const endPan = useCallback(() => {
    panState.current.active = false;
  }, []);

  const onDoubleClick = () => {
    setTx(0);
    setTy(0);
    setScale(1);
  };

  useEffect(() => {
    const handleUp = () => endPan();
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [endPan]);

  return (
    <div className="h-[520px] w-full max-w-5xl mx-auto select-none">
      <style>{buttonAnimCss}</style>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Drag to pan • Scroll to zoom • Double-click to reset</div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-xl border text-sm cursor-pointer hover:bg-gray-100"
            onClick={() => setScale(clamp(scale * 0.9, 0.2, 6))}
          >
            −
          </button>
          <div className="min-w-16 text-center text-sm">{Math.round(scale * 100)}%</div>
          <button
            className="px-2 py-1 rounded-xl border text-sm cursor-pointer hover:bg-gray-100"
            onClick={() => setScale(clamp(scale * 1.1, 0.2, 6))}
          >
            +
          </button>
          <button
            className="ml-2 px-3 py-1 rounded-xl border text-sm cursor-pointer hover:bg-gray-100"
            onClick={() => {
              setTx(0);
              setTy(0);
              setScale(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden rounded-2xl border bg-white cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="absolute top-0 left-0 will-change-transform"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Use public folder for image so it loads in preview */}
          <img src="/house_new.png" alt="House Scene" className="block" />
          {/* Overlay buttons in exact positions with animation */}
          <button className="absolute left-[210px] top-[110px] px-3 py-1 bg-orange-500 text-white text-xs rounded cursor-pointer shadow map-btn">
            GOLD
          </button>
          <button className="absolute left-[70px] top-[260px] px-3 py-1 bg-orange-500 text-white text-xs rounded cursor-pointer shadow map-btn" style={{animationDelay: '0.2s'}}>
            ANGLER
          </button>
          <button className="absolute left-[500px] top-[160px] px-3 py-1 bg-orange-500 text-white text-xs rounded cursor-pointer shadow map-btn" style={{animationDelay: '0.4s'}}>
            GOLD CHEST
          </button>
          <button className="absolute left-[720px] top-[100px] px-3 py-1 bg-orange-500 text-white text-xs rounded cursor-pointer shadow map-btn" style={{animationDelay: '0.6s'}}>
            GARDENER
          </button>
          <button className="absolute left-[600px] top-[240px] px-3 py-1 bg-orange-500 text-white text-xs rounded cursor-pointer shadow map-btn" style={{animationDelay: '0.8s'}}>
            REFERRALS
          </button>
        </div>
      </div>
    </div>
  );
} 