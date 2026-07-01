import React from 'react';
import { Compass, Swords, Cpu, Radio, User, Settings, ShieldAlert, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between h-screen shrink-0 select-none z-30">
      {/* Brand & Nav */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4D4F] to-[#b32426] flex items-center justify-center shadow-[0_0_20px_rgba(255,77,79,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-lg text-white tracking-tight block leading-none">SKILLFORGE</span>
            <span className="text-[10px] font-mono font-bold text-[#FF4D4F] tracking-widest uppercase">ENTERPRISE RIG</span>
          </div>
        </div>

        <div className="text-[11px] font-mono font-semibold text-[#8B8B8B] uppercase tracking-wider px-2 mb-3">
          PLATFORM MODULES
        </div>

        <nav className="space-y-1.5">
          <a
            href="#roadmap"
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#8B8B8B] hover:text-white hover:bg-white/5 transition group"
          >
            <Compass className="w-4 h-4 text-[#8B8B8B] group-hover:text-white transition" />
            <span>Roadmap Dashboard</span>
          </a>

          <a
            href="#arena"
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#8B8B8B] hover:text-white hover:bg-white/5 transition group"
          >
            <Swords className="w-4 h-4 text-[#8B8B8B] group-hover:text-white transition" />
            <span>Skill Arena Battles</span>
          </a>

          <a
            href="#insights"
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#8B8B8B] hover:text-white hover:bg-white/5 transition group"
          >
            <Cpu className="w-4 h-4 text-[#8B8B8B] group-hover:text-white transition" />
            <span>AI Intelligence Hub</span>
          </a>

          <a
            href="#warroom"
            className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#FF4D4F]/20 to-transparent border-l-4 border-[#FF4D4F] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-3.5">
              <Radio className="w-4 h-4 text-[#FF4D4F] animate-pulse" />
              <span>Executive War Room</span>
            </div>
            <span className="text-[9px] font-mono bg-[#FF4D4F] text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
              LIVE
            </span>
          </a>
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/10 bg-[#0d0d0d]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4D4F] to-[#4DA3FF] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#141414] flex items-center justify-center font-bold text-xs text-white">
              KV
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">Kabilan V.</h4>
            <span className="text-[10px] font-mono text-[#00D97E] block truncate">Staff Engineer Track • L6</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5">
          <button className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-white/80 transition">
            <User className="w-3.5 h-3.5" /> Profile
          </button>
          <button className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-white/80 transition">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>
    </aside>
  );
};
