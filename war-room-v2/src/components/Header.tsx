import React from 'react';
import { ArrowLeft, Shield, ChevronDown, UserCheck, HelpCircle, Settings, PhoneOff } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-white/[0.08] px-5 flex items-center justify-between shrink-0 bg-[#08080c] select-none z-20">
      {/* Left Side */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF4D4F] flex items-center justify-center font-black text-sm text-white">
            SF
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">SkillForge</span>
        </div>

        <button className="bg-[#14141e] border border-white/[0.12] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-3 transition hover:bg-white/10">
          <ArrowLeft className="w-3.5 h-3.5" /> End Interview
        </button>

        <div className="bg-[#FF4D4F]/15 border border-[#FF4D4F]/40 text-[#FF4D4F] px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#FF4D4F] shadow-[0_0_8px_#FF4D4F]" />
          REC 00:14:32
        </div>

        <span className="flex items-center gap-1.5 text-[#10B981] text-xs font-bold">
          <Shield className="w-3.5 h-3.5" /> 12ms Encrypted
        </span>

        <button className="bg-[#14141e] border border-white/10 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
          <span>Operating Systems Interview</span>
          <ChevronDown className="w-3 h-3 text-[#8B8B8B]" />
        </button>

        <button className="bg-[#14141e] border border-white/10 text-[#E879F9] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Google Staff Engineer</span>
          <ChevronDown className="w-3 h-3 text-[#8B8B8B]" />
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[#10B981] text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
          Interview in Progress
        </span>

        <div className="text-right border-l border-white/10 pl-4">
          <div className="text-[10px] text-[#8B8B8B] font-semibold uppercase tracking-wider">Time Remaining</div>
          <div className="text-base font-black text-white font-mono leading-tight">30:28</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg bg-[#14141e] border border-white/10 text-white flex items-center justify-center transition hover:bg-white/10">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg bg-[#14141e] border border-white/10 text-white flex items-center justify-center transition hover:bg-white/10">
            <Settings className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg bg-[#FF4D4F] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,77,79,0.5)] transition hover:bg-[#d9363e]">
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
