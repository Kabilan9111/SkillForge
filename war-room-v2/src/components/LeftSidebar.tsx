import React from 'react';
import { Home, FolderKanban, Code2, Radio, Video, BarChart3, Dna, User, Settings, Gem } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  return (
    <div className="w-[210px] border-r border-white/[0.08] p-3 flex flex-col justify-between shrink-0 bg-[#08080c] select-none">
      <div className="flex flex-col gap-1">
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <Home className="w-4 h-4 text-[#8B8B8B]" /> Home
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <FolderKanban className="w-4 h-4 text-[#8B8B8B]" /> Projects
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <Code2 className="w-4 h-4 text-[#8B8B8B]" /> Practice
        </a>
        
        {/* Active War Room Tab */}
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FF4D4F]/15 text-white text-xs font-bold cursor-pointer border border-[#FF4D4F]/30 shadow-[0_0_15px_rgba(255,77,79,0.15)]">
          <Radio className="w-4 h-4 text-[#FF4D4F]" /> War Room
        </a>

        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <Video className="w-4 h-4 text-[#8B8B8B]" /> Video Library
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <BarChart3 className="w-4 h-4 text-[#8B8B8B]" /> Skill Gap
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <Dna className="w-4 h-4 text-[#8B8B8B]" /> Coder&apos;s DNA
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <User className="w-4 h-4 text-[#8B8B8B]" /> Profile
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8B8B8B] text-xs font-semibold cursor-pointer hover:bg-white/5 transition">
          <Settings className="w-4 h-4 text-[#8B8B8B]" /> Settings
        </a>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Upgrade to Pro Card */}
        <div className="bg-gradient-to-br from-[#18080c] to-[#100812] border border-[#FF4D4F]/30 rounded-xl p-3 text-left">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-extrabold text-white">Upgrade to Pro</span>
            <Gem className="w-3.5 h-3.5 text-[#FF4D4F]" />
          </div>
          <p className="text-[10px] text-[#8B8B8B] leading-tight mb-2.5">
            Unlock advanced analytics, AI coach &amp; more.
          </p>
          <button className="w-full bg-gradient-to-r from-[#FF4D4F] to-[#D9363E] text-white py-1.5 rounded-lg text-[11px] font-extrabold shadow-[0_4px_12px_rgba(255,77,79,0.3)] transition hover:opacity-90">
            Upgrade Now
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            className="w-8 h-8 rounded-full object-cover border-[1.5px] border-[#FF4D4F]"
            alt="Arjun Dev"
          />
          <div>
            <div className="text-xs font-extrabold text-white leading-tight">Arjun Dev</div>
            <div className="text-[10px] text-[#10B981] font-bold">
              Pro Coder <span className="text-[#8B8B8B]">• 1872 XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
