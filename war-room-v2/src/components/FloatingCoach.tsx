import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, FastForward, CheckCircle2, MessageSquare } from 'lucide-react';

interface FloatingCoachProps {
  onTriggerAction: (action: 'hint' | 'repeat' | 'skip') => void;
}

const COACH_TIPS = [
  { text: "✨ Excellent communication and clean cadence.", type: "praise" },
  { text: "💡 Hint: Explicitly mention convoy effect and thread starvation.", type: "hint" },
  { text: "🔥 Good use of real-world distributed caching examples.", type: "praise" },
  { text: "⚡ Pro Tip: State your consistency SLA before explaining quorum.", type: "hint" },
  { text: "🎯 Slow down slightly when discussing kernel atomic operations.", type: "advice" }
];

export const FloatingCoach: React.FC<FloatingCoachProps> = ({ onTriggerAction }) => {
  const [tipIdx, setTipIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx(prev => (prev + 1) % COACH_TIPS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const currentTip = COACH_TIPS[tipIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-5 right-5 z-50 select-none"
    >
      <div className="bg-[#101010]/95 border border-[#FF4D4F]/60 rounded-2xl p-4 w-80 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF4D4F]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#FF4D4F] flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-xs text-white tracking-tight">AI STRATEGIC COACH</span>
          </div>
          <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-[#00D97E] font-semibold border border-white/5">
            GRAMMARLY ENGINE
          </span>
        </div>

        {/* Dynamic Tip Body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-xl text-xs font-medium leading-relaxed border mb-3 ${
              currentTip.type === 'praise'
                ? 'bg-[#00D97E]/10 border-[#00D97E]/30 text-white'
                : currentTip.type === 'hint'
                ? 'bg-[#FF4D4F]/10 border-[#FF4D4F]/30 text-white'
                : 'bg-[#4DA3FF]/10 border-[#4DA3FF]/30 text-white'
            }`}
          >
            {currentTip.text}
          </motion.div>
        </AnimatePresence>

        {/* Action Pills */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
          <button
            onClick={() => onTriggerAction('hint')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>Hint</span>
          </button>
          <button
            onClick={() => onTriggerAction('repeat')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#4DA3FF]" />
            <span>Repeat</span>
          </button>
          <button
            onClick={() => onTriggerAction('skip')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition active:scale-95"
          >
            <FastForward className="w-3.5 h-3.5 text-[#FF4D4F]" />
            <span>Skip</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
