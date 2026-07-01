import React from 'react';
import { FileText } from 'lucide-react';

export const BottomTimeline: React.FC = () => {
  return (
    <div className="h-18 bg-[#08080c] border-t border-white/[0.08] px-6 flex items-center justify-between shrink-0 select-none z-30 overflow-x-auto py-3">
      <div className="mr-6 shrink-0">
        <div className="text-[11px] font-bold text-[#8B8B8B]">Interview Timeline</div>
        <div className="text-[11px] text-[#666] font-mono">00:00</div>
      </div>

      {/* Timeline Nodes */}
      <div className="flex-1 flex items-center justify-between gap-1.5 min-w-[680px]">
        {/* Started */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_6px_#10B981]" />
          <span className="text-[10px] text-[#8B8B8B] font-semibold">Interview Started</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#10B981]" />

        {/* Ice Breaker */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">02:18</div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_6px_#10B981]" />
          <span className="text-[10px] text-[#8B8B8B] font-semibold">Ice Breaker</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#10B981]" />

        {/* Q1 */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">04:40</div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_6px_#10B981]" />
          <span className="text-[10px] text-[#8B8B8B] font-semibold">Q1: Process vs Thread</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#10B981]" />

        {/* Q2 */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">08:12</div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#08080c] shadow-[0_0_6px_#10B981]" />
          <span className="text-[10px] text-[#8B8B8B] font-semibold">Q2: Context Switch</span>
        </div>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-[#10B981] to-[#FF4D4F]" />

        {/* ACTIVE: Q3 Deadlock */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[11px] text-white font-extrabold font-mono -mb-0.5">13:42</div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF4D4F] border-[3px] border-white shadow-[0_0_14px_#FF4D4F] animate-pulse" />
          <span className="text-[11px] text-[#FF4D4F] font-extrabold">Q3: Deadlock</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e]" />

        {/* Q4 */}
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">18:30</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[10px] text-[#8B8B8B]">Q4: Scheduling</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e]" />

        {/* Q5 */}
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">23:10</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[10px] text-[#8B8B8B]">Q5: Virtual Memory</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e]" />

        {/* Wrap Up */}
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">28:50</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[10px] text-[#8B8B8B]">Final Wrap Up</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#1f1f2e]" />

        {/* End */}
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="text-[10px] text-[#666] font-mono -mb-0.5">35:00</div>
          <div className="w-3 h-3 rounded-full bg-[#1f1f2e]" />
          <span className="text-[10px] text-[#8B8B8B]">Interview End</span>
        </div>
      </div>

      <button className="bg-[#0f172a] border border-[#1e3a8a] text-[#60a5fa] hover:bg-[#1e293b] px-4 py-2 rounded-lg text-xs font-bold ml-6 shrink-0 flex items-center gap-1.5 transition">
        <FileText className="w-3.5 h-3.5" />
        <span>View Full Report</span>
      </button>
    </div>
  );
};
