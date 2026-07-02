import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

export const BottomTimeline: React.FC = () => {
  return (
    <div className="h-[90px] border-t border-white/[0.08] px-8 flex items-center justify-between shrink-0 bg-[#08080c] overflow-hidden select-none z-30">
      <div className="mr-8 shrink-0">
        <div className="text-[13px] font-extrabold text-[#8B8B8B]">Interview Timeline</div>
        <div className="text-xs text-[#666] font-mono mt-0.5">00:00</div>
      </div>

      {/* Timeline Nodes */}
      <div className="flex-1 flex items-center justify-between gap-2 min-w-0 overflow-hidden">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_8px_#10B981]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Interview Started</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#10B981] min-w-2" />

        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">02:18</div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_8px_#10B981]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Ice Breaker</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#10B981] min-w-2" />

        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">04:40</div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_8px_#10B981]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Q1: Process vs Thread</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#10B981] min-w-2" />

        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">08:12</div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_8px_#10B981]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Q2: Context Switch</span>
        </div>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-[#10B981] to-[#FF4D4F] min-w-2" />

        {/* ACTIVE NODE */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-[11px] text-white font-extrabold font-mono -mb-0.5">13:42</div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF4D4F] border-[2.5px] border-white shadow-[0_0_16px_#FF4D4F] animate-pulse" />
          <span className="text-[11px] text-[#FF4D4F] font-extrabold">Q3: Deadlock</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e] min-w-2" />

        <div className="flex flex-col items-center gap-1 shrink-0 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">18:30</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Q4: Scheduling</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e] min-w-2" />

        <div className="flex flex-col items-center gap-1 shrink-0 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">23:10</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Q5: Virtual Memory</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e] min-w-2" />

        <div className="flex flex-col items-center gap-1 shrink-0 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">38:00</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[11px] text-[#8B8B8B] font-bold">Final Wrap Up</span>
        </div>
      </div>

      <button className="bg-[#0f172a] border border-[#1e3a8a] text-[#60a5fa] px-4.5 py-2.5 rounded-xl text-[13px] font-extrabold ml-6 shrink-0 flex items-center gap-2 hover:bg-[#1e293b] transition-colors">
        <FileText className="w-4 h-4" /> View Full Report <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
