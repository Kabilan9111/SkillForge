import React, { useState } from 'react';
import { Bookmark, Play, Mic } from 'lucide-react';

export const CenterCol: React.FC = () => {
  const [autoTranscribe, setAutoTranscribe] = useState(true);

  return (
    <div className="flex flex-col gap-3.5 h-full min-h-0 overflow-hidden select-none">
      {/* 1. CURRENT QUESTION CARD */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-5 shrink-0 relative">
        <div className="text-xs font-bold text-[#8B8B8B]">Current Question</div>
        <Bookmark className="w-4 h-4 text-[#8B8B8B] absolute top-5 right-5 cursor-pointer" />
        
        <div className="text-4xl text-[#FF4D4F] leading-none font-serif mt-1 mb-[-8px]">“</div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white my-2">
          Explain Deadlock in Operating Systems.
        </h1>
        <p className="text-xs text-[#8B8B8B]">Take your time and explain with an example.</p>
      </div>

      {/* 2. LIVE CONVERSATION CARD */}
      <div className="flex-1 bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden">
        <div className="flex justify-between items-center pb-3 border-b border-white/5 shrink-0">
          <span className="text-sm font-extrabold text-white">Live Conversation</span>
          <div className="flex items-center gap-2 text-xs text-[#8B8B8B]">
            <span>Auto Transcription</span>
            <button
              onClick={() => setAutoTranscribe(!autoTranscribe)}
              className={`w-8 h-4.5 rounded-full transition-colors relative p-0.5 ${
                autoTranscribe ? 'bg-[#10B981]' : 'bg-[#222]'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white block transition-transform ${
                autoTranscribe ? 'translate-x-3.5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-5 pt-4 pr-2">
          {/* AI Message 1 */}
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#800] to-[#FF4D4F] border border-[#FF4D4F]/50 shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(255,77,79,0.4)]">
              <span className="w-3.5 h-0.5 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-xs font-bold text-white">AI Interviewer</span>
                  <span className="text-[11px] text-[#666] ml-1.5 font-mono">14:12:32</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[8, 14, 6, 16, 10].map((h, i) => (
                      <span key={i} style={{ height: `${h}px` }} className="w-0.5 bg-[#FF4D4F] rounded-full" />
                    ))}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#181822] flex items-center justify-center cursor-pointer">
                    <Play className="w-2.5 h-2.5 text-white ml-0.5 fill-white" />
                  </div>
                </div>
              </div>
              <div className="text-sm text-[#ddd] leading-relaxed">Explain Deadlock in Operating Systems.</div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex gap-3 items-start">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/20"
              alt="You"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-xs font-bold text-white">You</span>
                  <span className="text-[11px] text-[#666] ml-1.5 font-mono">14:13:02</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[10, 18, 8, 14, 12].map((h, i) => (
                      <span key={i} style={{ height: `${h}px` }} className="w-0.5 bg-[#10B981] rounded-full" />
                    ))}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#181822] flex items-center justify-center cursor-pointer">
                    <Play className="w-2.5 h-2.5 text-white ml-0.5 fill-white" />
                  </div>
                </div>
              </div>
              <div className="text-sm text-[#ddd] leading-relaxed">
                Deadlock is a situation in which two or more processes are blocked forever, waiting for each other to release resources. It occurs when four necessary conditions hold simultaneously...
              </div>
            </div>
          </div>

          {/* AI Message 2 */}
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#800] to-[#FF4D4F] border border-[#FF4D4F]/50 shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(255,77,79,0.4)]">
              <span className="w-3.5 h-0.5 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-xs font-bold text-white">AI Interviewer</span>
                  <span className="text-[11px] text-[#666] ml-1.5 font-mono">14:13:45</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[8, 16, 10, 18, 8].map((h, i) => (
                      <span key={i} style={{ height: `${h}px` }} className="w-0.5 bg-[#FF4D4F] rounded-full" />
                    ))}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#181822] flex items-center justify-center cursor-pointer">
                    <Play className="w-2.5 h-2.5 text-white ml-0.5 fill-white" />
                  </div>
                </div>
              </div>
              <div className="text-sm text-[#ddd] leading-relaxed">
                Good explanation! 👍<br />
                Now explain the four necessary conditions (Coffman Conditions) for Deadlock.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LISTENING BAR */}
      <div className="bg-[#0d0d12] border border-[#FF4D4F]/50 rounded-2xl p-3.5 px-6 flex items-center justify-between shadow-[0_0_25px_rgba(255,77,79,0.15)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4D4F] flex items-center justify-center shadow-[0_0_12px_#FF4D4F]">
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold text-white">Listening...</span>
        </div>

        {/* Center Waveform */}
        <div className="flex items-center gap-1 h-6">
          {[8, 16, 10, 24, 14, 20, 10].map((h, idx) => (
            <span key={idx} style={{ height: `${h}px` }} className="w-0.5 bg-[#FF4D4F] rounded-full" />
          ))}
        </div>

        <span className="text-xs text-[#8B8B8B]">Speak now</span>
      </div>
    </div>
  );
};
