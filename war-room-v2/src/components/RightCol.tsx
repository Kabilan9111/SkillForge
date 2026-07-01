import React from 'react';
import { TrendingUp, RotateCw, Star, Lightbulb, MessageSquare, Shield, Layers, Puzzle, BookOpen, Eye, Volume2, Gauge, Timer } from 'lucide-react';

export const RightCol: React.FC = () => {
  return (
    <div className="flex flex-col gap-3.5 h-full min-h-0 overflow-y-auto pr-1 select-none">
      {/* 1. LIVE EVALUATION CARD */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-4 shrink-0">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <span className="text-sm font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF4D4F]" /> Live Evaluation
          </span>
          <span className="text-[11px] text-[#8B8B8B] flex items-center gap-1">
            <RotateCw className="w-3 h-3 animate-spin" /> Updating...
          </span>
        </div>

        <div className="flex flex-col gap-3 mt-3.5">
          {/* 1 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-[#FF4D4F]" /> Technical Accuracy
              </span>
              <span className="font-bold text-[#10B981]">92% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[92%] h-full bg-[#FF4D4F] rounded-full" />
            </div>
          </div>

          {/* 2 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF8C00]" /> Communication
              </span>
              <span className="font-bold text-[#10B981]">88% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[88%] h-full bg-[#FF8C00] rounded-full" />
            </div>
          </div>

          {/* 3 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#A855F7]" /> Confidence
              </span>
              <span className="font-bold text-[#10B981]">85% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-[#A855F7] rounded-full" />
            </div>
          </div>

          {/* 4 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-[#3B82F6]" /> Depth of Knowledge
              </span>
              <span className="font-bold text-[#10B981]">90% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[90%] h-full bg-[#3B82F6] rounded-full" />
            </div>
          </div>

          {/* 5 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Puzzle className="w-3.5 h-3.5 text-[#06B6D4]" /> Problem Solving
              </span>
              <span className="font-bold text-[#10B981]">91% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[91%] h-full bg-[#06B6D4] rounded-full" />
            </div>
          </div>

          {/* 6 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#EAB308]" /> Vocabulary
              </span>
              <span className="font-bold text-[#FF4D4F]">87% ↓</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[87%] h-full bg-[#EAB308] rounded-full" />
            </div>
          </div>

          {/* 7 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-[#10B981]" /> Eye Contact
              </span>
              <span className="font-bold text-[#10B981]">82% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[82%] h-full bg-[#10B981] rounded-full" />
            </div>
          </div>

          {/* 8 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-[#3B82F6]" /> Voice Clarity
              </span>
              <span className="font-bold text-[#10B981]">89% ↑</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[89%] h-full bg-[#3B82F6] rounded-full" />
            </div>
          </div>

          {/* 9 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
                <Gauge className="w-3.5 h-3.5 text-[#8B5CF6]" /> Speaking Pace
              </span>
              <span className="font-bold text-[#10B981]">Good</span>
            </div>
            <div className="w-full h-1.5 bg-[#161620] rounded-full overflow-hidden">
              <div className="w-[75%] h-full bg-[#8B5CF6] rounded-full" />
            </div>
          </div>

          {/* 10 */}
          <div className="flex justify-between text-xs pt-0.5">
            <span className="text-[#ddd] flex items-center gap-1.5 font-medium">
              <Timer className="w-3.5 h-3.5 text-[#8B8B8B]" /> Filler Words
            </span>
            <span className="font-bold text-[#10B981]">2 detected</span>
          </div>
        </div>
      </div>

      {/* 2. OVERALL INTERVIEW SCORE CARD */}
      <div className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl p-5 text-center shrink-0">
        <div className="text-xs font-bold text-white text-left mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#FF8C00]" /> Overall Interview Score
        </div>

        <div className="flex items-center justify-center gap-4 my-2.5">
          <span className="text-[46px] font-black text-white font-mono leading-none">91%</span>
          <div className="w-12 h-12 rounded-full border-[6px] border-[#161620] border-r-[#FF4D4F] border-t-[#FF8C00] rotate-45" />
        </div>

        <div className="text-xs font-bold text-[#10B981] flex items-center justify-center gap-1.5 mt-2.5">
          <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" /> Excellent Performance
        </div>
      </div>
    </div>
  );
};
