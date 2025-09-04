import React from 'react';
import PanZoomViewport from './components/PanZoomViewport.jsx';

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontFamily: 'sans-serif', marginBottom: 12 }}>Pan & Zoom Demo</h1>
      <PanZoomViewport />
    </div>
  );
} 