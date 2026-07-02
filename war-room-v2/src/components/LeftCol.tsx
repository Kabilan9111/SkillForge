import React, { useState } from 'react';
import { Sparkles, MoreHorizontal, Video, Mic, MonitorUp, Settings, Bolt } from 'lucide-react';

export const LeftCol: React.FC = () => {
  const [noiseCancel, setNoiseCancel] = useState(true);

  return (
    <>
      {/* Card 1: AI Interviewer (~340px height feel, centered elements, 24px padding, 18px radius) */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-[18px] p-6 flex flex-col items-center justify-center text-center relative shrink-0 min-h-[280px]">
        <div className="absolute top-5 left-6 right-6 flex justify-between items-center">
          <span className="text-[13px] font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4D4F]" /> Al Interviewer
          </span>
          <MoreHorizontal className="w-4 h-4 text-[#8B8B8B] cursor-pointer" />
        </div>
        
        <div className="mt-4">
          <span className="text-sm font-bold text-white block">Google Staff Engineer</span>
          <span className="text-xs text-[#8B8B8B] block mt-0.5">15+ Years Experience</span>
        </div>

        {/* Centered Glowing Voice Orb */}
        <div className="relative w-28 h-28 my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#FF4D4F]/50 bg-gradient-to-tr from-[#FF4D4F]/30 via-[#FF4D4F]/10 to-transparent shadow-[0_0_40px_rgba(255,77,79,0.4),inset_0_0_25px_rgba(255,77,79,0.7)]" />
          <div className="relative z-10 flex items-center gap-1 h-8">
            {[10, 20, 32, 18, 34, 22, 12].map((height, idx) => (
              <span
                key={idx}
                style={{ height: `${height}px` }}
                className="w-0.75 rounded-full bg-gradient-to-t from-[#FF4D4F] to-[#FFA07A]"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#FF4D4F] text-xs font-extrabold mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF4D4F] shadow-[0_0_8px_#FF4D4F]" /> Speaking...
        </div>

        <div className="text-[13px] font-extrabold text-white">Question 3 of 8</div>
        <div className="text-xs text-[#FF4D4F] font-bold mt-0.5">Topic: Deadlock Prevention</div>
      </div>

      {/* Card 2: Candidate Feed (Large Landscape Webcam 16:9, ~75% visual dominance) */}
      <div className="bg-[#0d0d12] border-[1.5px] border-[#FF4D4F] shadow-[0_0_22px_rgba(255,77,79,0.25)] rounded-[18px] p-6 flex flex-col gap-3.5 flex-1 min-h-0 justify-between">
        <div className="flex justify-between items-center shrink-0">
          <span className="text-[13px] font-extrabold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-[#FF4D4F]" /> Candidate Feed
          </span>
          <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" /> LIVE
          </span>
        </div>

        {/* Candidate Photo Preview */}
        <div className="flex-1 min-h-[180px] bg-[#14141c] rounded-[14px] relative overflow-hidden flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
            className="w-full h-full object-cover object-[center_20%]"
            alt="Candidate Feed"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-extrabold text-[#10B981] bg-black/65 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> LIVE
          </div>
          <div className="absolute top-3 right-3 text-[11px] font-bold text-[#ddd] bg-black/65 px-2.5 py-1 rounded-md">
            1080P • 60 FPS
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
            <Mic className="w-4 h-4 text-[#10B981]" /> Mic Active
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
            <Video className="w-4 h-4 text-[#10B981]" /> Camera HD
          </div>
        </div>
      </div>

      {/* Card 3: Controls (Equal width/height, 64px height, rounded 14px) */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-[18px] p-4 shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <button className="h-16 bg-[#FF4D4F]/15 border-[1.5px] border-[#FF4D4F] text-[#FF4D4F] rounded-[14px] flex flex-col items-center justify-center gap-1.5 transition-all">
            <div className="w-5.5 h-5.5 rounded-full bg-[#FF4D4F] flex items-center justify-center text-white">
              <Mic className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-extrabold">Mic On</span>
          </button>
          <button className="h-16 bg-[#161620] border border-white/[0.08] text-white rounded-[14px] flex flex-col items-center justify-center gap-1.5 transition-all">
            <Video className="w-4.5 h-4.5 text-[#ddd]" />
            <span className="text-[11px] font-extrabold">Camera On</span>
          </button>
          <button className="h-16 bg-[#161620] border border-white/[0.08] text-white rounded-[14px] flex flex-col items-center justify-center gap-1.5 transition-all">
            <MonitorUp className="w-4.5 h-4.5 text-[#ddd]" />
            <span className="text-[11px] font-extrabold">Share Screen</span>
          </button>
          <button className="h-16 bg-[#161620] border border-white/[0.08] text-white rounded-[14px] flex flex-col items-center justify-center gap-1.5 transition-all">
            <Settings className="w-4.5 h-4.5 text-[#ddd]" />
            <span className="text-[11px] font-extrabold">Settings</span>
          </button>
        </div>
      </div>

      {/* Card 4: Noise Cancellation Row (54px elegant row) */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-[18px] px-6 h-[54px] flex justify-between items-center shrink-0">
        <span className="text-[13px] text-white flex items-center gap-2 font-bold">
          <Bolt className="w-4 h-4 text-[#FF4D4F]" /> AI Noise Cancellation
        </span>
        <button
          onClick={() => setNoiseCancel(!noiseCancel)}
          className={`w-11 h-6 rounded-full transition-colors relative p-0.75 shadow-[0_0_12px_rgba(255,77,79,0.4)] ${
            noiseCancel ? 'bg-[#FF4D4F]' : 'bg-[#222]'
          }`}
        >
          <span className={`w-4.5 h-4.5 rounded-full bg-white block transition-transform ${
            noiseCancel ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </button>
      </div>
    </>
  );
};
