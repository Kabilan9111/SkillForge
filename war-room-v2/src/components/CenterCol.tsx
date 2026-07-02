import React, { useState } from 'react';
import { Bookmark, Play, Mic, Shuffle } from 'lucide-react';

export const CenterCol: React.FC = () => {
  const [autoTranscribe, setAutoTranscribe] = useState(true);

  return (
    <>
      {/* Category Tabs Row */}
      <div className="flex items-center justify-center gap-2.5 shrink-0">
        <button className="bg-[#FF4D4F]/20 border border-[#FF4D4F] text-white px-4.5 py-1.5 rounded-xl text-[13px] font-extrabold">Coding</button>
        <button className="bg-[#12121a] border border-white/[0.08] text-[#8B8B8B] px-4.5 py-1.5 rounded-xl text-[13px] font-semibold">System Design</button>
        <button className="bg-[#12121a] border border-white/[0.08] text-[#8B8B8B] px-4.5 py-1.5 rounded-xl text-[13px] font-semibold">Behavioral</button>
        <button className="bg-[#12121a] border border-white/[0.08] text-[#8B8B8B] px-4.5 py-1.5 rounded-xl text-[13px] font-semibold">Architecture</button>
        <button className="bg-[#12121a] border border-white/[0.08] text-[#8B8B8B] px-4.5 py-1.5 rounded-xl text-[13px] font-semibold">Code Review</button>
        <button className="bg-[#12121a] border border-white/[0.08] text-[#8B8B8B] px-4.5 py-1.5 rounded-xl text-[13px] font-semibold">Leadership</button>
      </div>

      {/* Card 1: Current Question (24px padding, 18px radius) */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-[18px] p-6 shrink-0 relative">
        <div className="text-xs font-extrabold text-[#8B8B8B] uppercase tracking-wide">Current Question</div>
        <Bookmark className="absolute top-6 right-6 w-4 h-4 text-[#8B8B8B] cursor-pointer" />
        
        <div className="text-4xl text-[#FF4D4F] leading-none font-serif my-1 -mb-2.5">“</div>
        <h1 className="text-xl font-black text-white my-2 tracking-tight">Explain Deadlock in Operating Systems.</h1>
        <p className="text-[13px] text-[#8B8B8B] mb-4">Take your time and explain with an example.</p>
        
        {/* Badges */}
        <div className="flex items-center gap-2.5">
          <span className="bg-[#161620] border border-white/[0.08] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF8C00]" /> Medium
          </span>
          <span className="bg-[#161620] border border-white/[0.08] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-[#FF4D4F] font-black">G</span> Google
          </span>
          <span className="bg-[#161620] border border-white/[0.08] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Shuffle className="w-3 h-3 text-[#EAB308]" /> Operating Systems
          </span>
        </div>
      </div>

      {/* Card 2: Live Conversation (Owns vertical space, scrolling feed inside) */}
      <div className="flex-1 bg-[#0d0d12] border border-white/[0.08] rounded-[18px] p-6 flex flex-col min-h-0 overflow-hidden">
        <div className="flex justify-between items-center pb-3.5 border-b border-white/[0.06] shrink-0">
          <span className="text-sm font-black text-white">Live Conversation</span>
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#8B8B8B]">
            <span>Auto Transcription</span>
            <button
              onClick={() => setAutoTranscribe(!autoTranscribe)}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                autoTranscribe ? 'bg-[#10B981]' : 'bg-[#222]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white block transition-transform ${
                autoTranscribe ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pt-4 pr-2 min-h-0">
          {/* AI Message 1 */}
          <div className="flex gap-3.5 items-start bg-[#13131c] p-3.5 rounded-[14px] border border-white/[0.04]">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#800] to-[#FF4D4F] border border-[#FF4D4F]/50 shrink-0 flex items-center justify-center">
              <span className="w-3 h-0.5 bg-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-[13px] font-extrabold text-white">AI Interviewer</span>
                  <span className="text-[11px] text-[#666] ml-2">14:12:32</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <span className="w-0.75 h-2 bg-[#FF4D4F] rounded-full" />
                    <span className="w-0.75 h-3.5 bg-[#FF4D4F] rounded-full" />
                    <span className="w-0.75 h-2.5 bg-[#FF4D4F] rounded-full" />
                  </span>
                  <Play className="w-3 h-3 text-white fill-white cursor-pointer" />
                </div>
              </div>
              <div className="text-[13.5px] text-[#eee] leading-relaxed">Explain Deadlock in Operating Systems.</div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-3.5 items-start bg-[#13161c] p-3.5 rounded-[14px] border border-[#10B981]/15">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border-[1.5px] border-[#10B981]" alt="You" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-[13px] font-extrabold text-white">You</span>
                  <span className="text-[11px] text-[#666] ml-2">14:13:02</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <span className="w-0.75 h-2.5 bg-[#10B981] rounded-full" />
                    <span className="w-0.75 h-4 bg-[#10B981] rounded-full" />
                    <span className="w-0.75 h-2 bg-[#10B981] rounded-full" />
                  </span>
                  <Play className="w-3 h-3 text-white fill-white cursor-pointer" />
                </div>
              </div>
              <div className="text-[13.5px] text-[#eee] leading-relaxed">Deadlock is a situation in which two or more processes are blocked forever, waiting for each other to release resources. It occurs when four necessary conditions hold simultaneously...</div>
            </div>
          </div>

          {/* AI Message 2 */}
          <div className="flex gap-3.5 items-start bg-[#13131c] p-3.5 rounded-[14px] border border-white/[0.04]">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#800] to-[#FF4D4F] border border-[#FF4D4F]/50 shrink-0 flex items-center justify-center">
              <span className="w-3 h-0.5 bg-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-[13px] font-extrabold text-white">AI Interviewer</span>
                  <span className="text-[11px] text-[#666] ml-2">14:13:45</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <span className="w-0.75 h-2.5 bg-[#FF4D4F] rounded-full" />
                    <span className="w-0.75 h-4 bg-[#FF4D4F] rounded-full" />
                  </span>
                  <Play className="w-3 h-3 text-white fill-white cursor-pointer" />
                </div>
              </div>
              <div className="text-[13.5px] text-[#eee] leading-relaxed">Good explanation! 👍<br/>Now explain the four necessary conditions (Coffman Conditions) for Deadlock.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Listening Bar (54px tall) */}
      <div className="bg-[#0d0d12] border-[1.5px] border-[#FF4D4F] rounded-[18px] px-6 h-[54px] flex items-center justify-between shadow-[0_0_25px_rgba(255,77,79,0.25)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4D4F] flex items-center justify-center shadow-[0_0_12px_#FF4D4F]">
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold text-white">Listening...</span>
        </div>

        <div className="flex items-center gap-1 h-5.5">
          {[8, 16, 10, 20, 14, 18].map((h, i) => (
            <span key={i} style={{ height: `${h}px` }} className="w-0.75 bg-[#FF4D4F] rounded-full" />
          ))}
        </div>

        <span className="text-[13px] font-bold text-[#8B8B8B]">Speak now</span>
      </div>
    </>
  );
};
