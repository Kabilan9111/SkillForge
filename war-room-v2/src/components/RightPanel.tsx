import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Award, Zap, CheckCircle2 } from 'lucide-react';
import { InterviewState } from '../types';

interface RightPanelProps {
  interviewState: InterviewState;
}

export const RightPanel: React.FC<RightPanelProps> = ({ interviewState }) => {
  // Dynamic simulated continuous telemetry drift for authentic Apple WWDC demo feel
  const [metrics, setMetrics] = useState({
    confidence: 94,
    communication: 96,
    technicalAccuracy: 91,
    depthOfKnowledge: 89,
    problemSolving: 92,
    leadership: 90,
    vocabulary: 95,
    answerStructure: 93,
    examplesUsed: 94,
    eyeContact: 92,
    voiceClarity: 98,
    speakingSpeed: 142, // WPM
    fillerWords: 2, // per min
    overallScore: 94.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const drift = (min: number, max: number, current: number) => {
          const delta = (Math.random() - 0.48) * 0.6;
          return Math.min(max, Math.max(min, Number((current + delta).toFixed(1))));
        };
        return {
          ...prev,
          confidence: drift(90, 98, prev.confidence),
          communication: drift(92, 99, prev.communication),
          technicalAccuracy: drift(88, 96, prev.technicalAccuracy),
          depthOfKnowledge: drift(85, 94, prev.depthOfKnowledge),
          problemSolving: drift(89, 97, prev.problemSolving),
          eyeContact: drift(88, 96, prev.eyeContact),
          overallScore: drift(92, 96, prev.overallScore)
        };
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const metricItems = [
    { label: 'Confidence', val: `${metrics.confidence}%`, num: metrics.confidence, color: '#00D97E' },
    { label: 'Communication Cadence', val: `${metrics.communication}%`, num: metrics.communication, color: '#4DA3FF' },
    { label: 'Technical Accuracy', val: `${metrics.technicalAccuracy}%`, num: metrics.technicalAccuracy, color: '#FF4D4F' },
    { label: 'Depth of Knowledge', val: `${metrics.depthOfKnowledge}%`, num: metrics.depthOfKnowledge, color: '#FFC857' },
    { label: 'Problem Solving Bar', val: `${metrics.problemSolving}%`, num: metrics.problemSolving, color: '#00D97E' },
    { label: 'Executive Leadership', val: `${metrics.leadership}%`, num: metrics.leadership, color: '#4DA3FF' },
    { label: 'Domain Vocabulary', val: `${metrics.vocabulary}%`, num: metrics.vocabulary, color: '#00D97E' },
    { label: 'Answer Structure', val: `${metrics.answerStructure}%`, num: metrics.answerStructure, color: '#FFC857' },
    { label: 'Concrete Examples Used', val: `${metrics.examplesUsed}%`, num: metrics.examplesUsed, color: '#00D97E' },
    { label: 'Eye Contact & Gaze', val: `${metrics.eyeContact}%`, num: metrics.eyeContact, color: '#4DA3FF' },
    { label: 'HD Voice Clarity', val: `${metrics.voiceClarity}%`, num: metrics.voiceClarity, color: '#00D97E' }
  ];

  return (
    <aside className="col-span-3 flex flex-col gap-3.5 h-full min-h-0 overflow-y-auto pr-1 select-none">
      {/* 1. OVERALL EVALUATION CARD */}
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 shrink-0 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-mono font-bold text-white/70 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FF4D4F] animate-pulse" /> LIVE AI EVALUATION
          </span>
          <span className="text-[10px] font-mono bg-[#00D97E]/10 border border-[#00D97E]/30 text-[#00D97E] px-2 py-0.5 rounded font-bold">
            STRONG HIRE BAR
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3">
          <div>
            <span className="text-3xl md:text-4xl font-mono font-extrabold text-white tracking-tight">
              {metrics.overallScore}
            </span>
            <span className="text-xs text-[#8B8B8B] font-mono ml-1">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#00D97E] bg-[#00D97E]/10 px-2.5 py-1 rounded-lg border border-[#00D97E]/20">
            <TrendingUp className="w-3.5 h-3.5" /> Top 2% Global
          </div>
        </div>

        {/* Real-time speech cadence indicators */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
          <div className="bg-[#101010] p-2 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-[#8B8B8B] block">SPEAKING PACE</span>
            <span className="font-mono font-bold text-white text-sm">{metrics.speakingSpeed} <span className="text-[10px] font-normal text-[#8B8B8B]">WPM</span></span>
          </div>
          <div className="bg-[#101010] p-2 rounded-lg border border-white/5">
            <span className="text-[10px] font-mono text-[#8B8B8B] block">FILLER WORDS</span>
            <span className="font-mono font-bold text-[#00D97E] text-sm">{metrics.fillerWords} <span className="text-[10px] font-normal text-[#8B8B8B]">/ min</span></span>
          </div>
        </div>
      </div>

      {/* 2. CONTINUOUS DYNAMIC METRICS LIST */}
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg shrink-0">
        <span className="text-[11px] font-mono font-bold text-white/70 uppercase">
          TELEMETRY SCORECARD
        </span>

        <div className="flex flex-col gap-2.5">
          {metricItems.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8B8B8B] font-medium">{item.label}</span>
                <span className="font-mono font-bold text-white">{item.val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#101010] rounded-full overflow-hidden border border-white/5">
                <motion.div
                  animate={{ width: `${item.num}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ backgroundColor: item.color }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONFIDENCE TREND SPARKLINE */}
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 shadow-lg shrink-0 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[11px] font-mono font-bold text-white/70 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FFC857]" /> CONFIDENCE DRIFT CHART
          </span>
          <span className="text-[10px] font-mono text-[#00D97E]">Stable Rise</span>
        </div>

        <div className="h-16 flex items-end justify-between gap-1 pt-2">
          {[60, 68, 72, 75, 80, 84, 82, 88, 91, 93, 94, 94, 95].map((val, i) => (
            <motion.div
              key={i}
              animate={{ height: `${(val / 100) * 100}%` }}
              transition={{ duration: 0.8 }}
              className="w-full bg-gradient-to-t from-[#FF4D4F]/30 to-[#FF4D4F] rounded-t-sm"
            />
          ))}
        </div>
      </div>
    </aside>
  );
};
