import React from 'react';
import { Header } from './components/Header';
import { LeftCol } from './components/LeftCol';
import { CenterCol } from './components/CenterCol';
import { RightCol } from './components/RightCol';
import { BottomTimeline } from './components/BottomTimeline';

export default function App() {
  return (
    <div className="h-screen w-screen min-w-[1200px] bg-[#08080c] text-white flex flex-col overflow-hidden font-sans selection:bg-[#FF4D4F] selection:text-white select-none box-border">
      {/* 1. TOP INTERVIEW HEADER (56px) */}
      <Header />

      {/* 2. BODY CONTAINER (27% : 45% : 28% GRID, 16px GAPS & PADDING) */}
      {/* Height = 100vh - Header(56px) - Timeline(64px) = calc(100vh - 120px) */}
      <main 
        className="grid grid-cols-[27fr_45fr_28fr] gap-4 p-4 min-h-0 min-w-0 overflow-hidden bg-[#08080c] box-border"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {/* COLUMN 1: LEFT MEDIA COLUMN (27%) */}
        <div className="min-h-0 min-w-0 overflow-hidden h-full flex flex-col justify-between gap-3.5">
          <LeftCol />
        </div>

        {/* COLUMN 2: CENTER CONVERSATION COLUMN (45%) */}
        <div className="min-h-0 min-w-0 overflow-hidden h-full flex flex-col justify-between gap-3.5">
          <CenterCol />
        </div>

        {/* COLUMN 3: RIGHT EVALUATION COLUMN (28%) */}
        <div className="min-h-0 min-w-0 overflow-hidden h-full flex flex-col justify-between gap-3.5">
          <RightCol />
        </div>
      </main>

      {/* 3. BOTTOM TIMELINE (Spans entire width 100vw, 64px height) */}
      <BottomTimeline />
    </div>
  );
}
