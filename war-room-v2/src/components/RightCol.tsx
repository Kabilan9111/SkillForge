import React from 'react';
import { RefreshCw, Lightbulb, Heart, Shield, Layers, Puzzle, BookOpen, Eye, Volume2, Gauge, Timer, LineChart } from 'lucide-react';

export const RightCol: React.FC = () => {
  return (
    <>
      {/* Card 1: Live Evaluation (Spacious, 24px padding, 6px progress bars, 14-18px metric spacing) */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-[18px] p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center pb-3.5 border-b border-white/[0.06] shrink-0">
          <span className="text-sm font-black text-white flex items-center gap-2">
            <LineChart className="w-4 h-4 text-[#FF4D4F]" /> Live Evaluation
          </span>
          <span className="text-xs text-[#8B8B8B] flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
          </span>
        </div>

        <div className="flex flex-col justify-between flex-1 overflow-y-auto pt-3 pr-1 gap-3.5">
          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Lightbulb className="w-3.5 h-3.5 text-[#FF4D4F]" /> Technical Accuracy</span>
              <span className="font-extrabold text-[#10B981]">92% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[92%] h-full bg-[#FF4D4F] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-[#FF8C00]" /> Communication</span>
              <span className="font-extrabold text-[#10B981]">88% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[88%] h-full bg-[#FF8C00] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-[#A855F7]" /> Confidence</span>
              <span className="font-extrabold text-[#FF4D4F]">85% ↓</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[85%] h-full bg-[#A855F7] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-[#3B82F6]" /> Depth of Knowledge</span>
              <span className="font-extrabold text-[#10B981]">90% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[90%] h-full bg-[#3B82F6] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Puzzle className="w-3.5 h-3.5 text-[#06B6D4]" /> Problem Solving</span>
              <span className="font-extrabold text-[#10B981]">91% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[91%] h-full bg-[#06B6D4] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-[#EAB308]" /> Vocabulary</span>
              <span className="font-extrabold text-[#FF4D4F]">87% ↓</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[87%] h-full bg-[#EAB308] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-[#10B981]" /> Eye Contact</span>
              <span className="font-extrabold text-[#10B981]">82% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[82%] h-full bg-[#10B981] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Volume2 className="w-3.5 h-3.5 text-[#3B82F6]" /> Voice Clarity</span>
              <span className="font-extrabold text-[#10B981]">89% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[89%] h-full bg-[#3B82F6] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] mb-1.5 font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Gauge className="w-3.5 h-3.5 text-[#8B5CF6]" /> Speaking Pace</span>
              <span className="font-extrabold text-[#10B981]">Good</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden"><div className="w-[75%] h-full bg-[#8B5CF6] rounded-full" /></div>
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] font-semibold">
              <span className="text-[#eee] flex items-center gap-2"><Timer className="w-3.5 h-3.5 text-[#8B8B8B]" /> Filler Words</span>
              <span className="font-extrabold text-[#10B981]">2 detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Overall Interview Score (More whitespace, 24px padding, larger 76px gauge) */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-[18px] p-6 shrink-0">
        <div className="text-[13px] font-extrabold text-white text-left mb-3 flex items-center gap-2">
          <LineChart className="w-4 h-4 text-[#FF8C00]" /> Overall Interview Score
        </div>
        
        <div className="flex items-center justify-around gap-4 mt-1.5">
          {/* Circular Gauge */}
          <div className="relative w-19 h-19 rounded-full border-[7px] border-[#161620] border-r-[#FF4D4F] border-t-[#FF8C00] rotate-45 flex items-center justify-center">
            <span className="text-xl font-black text-white font-mono -rotate-45">91%</span>
          </div>

          <div className="text-left">
            <div className="text-lg font-black text-[#10B981] leading-tight">Excellent</div>
            <div className="text-sm font-extrabold text-white mt-0.5">Performance</div>
            <div className="text-xs text-[#EAB308] mt-1">⭐⭐⭐⭐⭐</div>
          </div>
        </div>
      </div>
    </>
  );
};
