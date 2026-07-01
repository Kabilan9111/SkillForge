import React from 'react';
import { Header } from './components/Header';
import { LeftCol } from './components/LeftCol';
import { CenterCol } from './components/CenterCol';
import { RightCol } from './components/RightCol';
import { BottomTimeline } from './components/BottomTimeline';

export default function App() {
  return (
    <div className="h-screen w-screen bg-[#08080c] text-white flex flex-col overflow-hidden font-sans selection:bg-[#FF4D4F] selection:text-white">
      {/* TOP HEADER */}
      <Header />

      {/* THREE-COLUMN DESKTOP LAYOUT GRID */}
      <main className="flex-1 grid grid-cols-[310px_minmax(0,1fr)_330px] gap-4 p-4 min-h-0 overflow-hidden bg-[#08080c]">
        {/* LEFT PANEL */}
        <div className="min-h-0 overflow-hidden">
          <LeftCol />
        </div>

        {/* CENTER PANEL */}
        <div className="min-h-0 overflow-hidden">
          <CenterCol />
        </div>

        {/* RIGHT PANEL */}
        <div className="min-h-0 overflow-hidden">
          <RightCol />
        </div>
      </main>

      {/* BOTTOM TIMELINE */}
      <BottomTimeline />
    </div>
  );
}
