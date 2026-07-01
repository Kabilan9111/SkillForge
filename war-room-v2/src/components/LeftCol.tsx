import React, { useState } from 'react';
import { Sparkles, MoreHorizontal, Video, Mic, MonitorUp, Settings, Bolt } from 'lucide-react';

export const LeftCol: React.FC = () => {
  const [noiseCancel, setNoiseCancel] = useState(true);

  return (
    <div className="flex flex-col gap-3.5 h-full min-h-0 overflow-y-auto pr-1 select-none">
      {/* 1. AI INTERVIEWER CARD */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-4 flex flex-col items-center text-center relative shrink-0">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4D4F]" /> Al Interviewer
          </span>
          <MoreHorizontal className="w-4 h-4 text-[#8B8B8B] cursor-pointer" />
        </div>
        
        <div className="mt-1">
          <span className="text-xs text-[#8B8B8B] block">Google Staff Engineer</span>
          <span className="text-[11px] text-[#666] block">15+ Years Experience</span>
        </div>

        {/* Central Glowing Orb with Crossing Audio Waveforms */}
        <div className="relative w-40 h-40 my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#FF4D4F]/50 bg-gradient-to-tr from-[#FF4D4F]/30 via-[#FF4D4F]/10 to-transparent shadow-[0_0_45px_rgba(255,77,79,0.4),inset_0_0_25px_rgba(255,77,79,0.7)] animate-pulse" />
          
          {/* Waveforms */}
          <div className="relative z-10 flex items-center gap-1 h-10">
            {[10, 22, 35, 18, 42, 28, 14, 32, 20, 38, 16, 25, 12].map((height, idx) => (
              <span
                key={idx}
                style={{ height: `${height}px` }}
                className="w-0.5 rounded-full bg-gradient-to-t from-[#FF4D4F] to-[#FFA07A] shadow-[0_0_6px_#FF4D4F]"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#FF4D4F] text-xs font-bold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4F] animate-ping" /> Speaking...
        </div>

        <div className="text-xs font-bold text-white">Question 3 of 8</div>
        <div className="text-xs text-[#FF4D4F] font-semibold mt-0.5">Topic: Deadlock Prevention</div>
      </div>

      {/* 2. YOUR CAMERA CARD */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-3.5 flex flex-col gap-2.5 shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#8B8B8B]" /> Your Camera
          </span>
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#10B981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> LIVE
          </span>
        </div>

        {/* Realistic Candidate Feed */}
        <div className="h-36 bg-[#14141c] rounded-xl relative overflow-hidden flex items-center justify-center border border-white/5">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
            className="w-full h-full object-cover"
            alt="Candidate Feed"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
            <span className="bg-[#10B981] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">HD</span>
            <Mic className="w-3 h-3 text-[#10B981]" />
          </div>
        </div>
      </div>

      {/* 3. CONTROLS PANEL */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-3.5 flex flex-col gap-3 shrink-0">
        <div className="grid grid-cols-4 gap-2">
          <button className="bg-[#FF4D4F]/15 border border-[#FF4D4F] text-[#FF4D4F] py-2.5 px-1 rounded-xl flex flex-col items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#FF4D4F] flex items-center justify-center text-white">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold">Mic On</span>
          </button>

          <button className="bg-[#161620] border border-white/[0.08] text-white py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1">
            <Video className="w-4 h-4 text-[#ddd] my-1" />
            <span className="text-[10px] font-bold">Camera On</span>
          </button>

          <button className="bg-[#161620] border border-white/[0.08] text-white py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1">
            <MonitorUp className="w-4 h-4 text-[#ddd] my-1" />
            <span className="text-[10px] font-bold">Share Screen</span>
          </button>

          <button className="bg-[#161620] border border-white/[0.08] text-white py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1">
            <Settings className="w-4 h-4 text-[#ddd] my-1" />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>

        <div className="pt-2.5 border-t border-white/[0.08] flex justify-between items-center">
          <span className="text-xs text-[#aaa] flex items-center gap-1.5">
            <Bolt className="w-3.5 h-3.5 text-[#8B8B8B]" /> Noise Cancellation
          </span>
          <button
            onClick={() => setNoiseCancel(!noiseCancel)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              noiseCancel ? 'bg-[#FF4D4F]' : 'bg-[#222]'
            }`}
          >
            <span className={`w-4 h-4 rounded-full bg-white block transition-transform ${
              noiseCancel ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};
