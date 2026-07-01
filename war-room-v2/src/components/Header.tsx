import React from 'react';
import { ChevronDown, Power, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-[#08080c] border-b border-white/[0.08] px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left Side */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF4D4F] flex items-center justify-center font-black text-sm text-white shadow-sm">
            SF
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">SkillForge</span>
        </div>

        <button className="bg-[#14141e] hover:bg-[#1c1c2b] border border-white/10 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ml-3 transition">
          <span>Operating Systems Interview</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8B8B8B]" />
        </button>

        <span className="bg-[#14141e] border border-white/[0.08] text-[#8B8B8B] px-3 py-1.5 rounded-lg text-xs font-semibold">
          Senior Level
        </span>

        <span className="bg-[#14141e] border border-white/[0.08] text-[#E879F9] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#E879F9]" />
          <span>Google Staff Engineer</span>
        </span>

        <div className="flex items-center gap-1.5 text-[#10B981] text-xs font-bold ml-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
          <span>Interview in Progress</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-[#FF4D4F] text-sm font-extrabold font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-ping" />
            <span>00:14:32</span>
          </div>
          <span className="text-[11px] text-[#8B8B8B] block">Time Remaining: 30:28</span>
        </div>

        <button
          onClick={() => alert("Ending session...")}
          className="bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 border border-[#FF4D4F] text-[#FF4D4F] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition active:scale-95"
        >
          <Power className="w-3.5 h-3.5" />
          <span>End Interview</span>
        </button>
      </div>
    </header>
  );
};
