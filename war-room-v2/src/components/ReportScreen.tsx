import React from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, RotateCcw, CheckCircle2, AlertTriangle, BookOpen, UserCheck } from 'lucide-react';
import { TrackName } from '../types';

interface ReportScreenProps {
  track: TrackName;
  onRestart: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ track, onRestart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full select-none"
    >
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#161616] via-[#121212] to-[#161616] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#00D97E]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#00D97E]/15 border border-[#00D97E] text-[#00D97E] font-extrabold text-xs px-3 py-1 rounded-full">
              STRONG HIRE (L6 STAFF BAR)
            </span>
            <span className="font-mono text-xs text-[#8B8B8B]">DOSSIER #EV-2035-WAR</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Executive Evaluation Report
          </h1>
          <p className="text-sm text-[#8B8B8B] mt-1">
            Track: <strong className="text-white">{track}</strong> • Interrogator: <strong className="text-white">Elena Vance (OpenAI Voice Engine)</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("📑 Generating Executive Candidate PDF Dossier...")}
            className="flex items-center gap-2 bg-[#181818] hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-5 py-3 rounded-xl transition"
          >
            <Download className="w-4 h-4 text-[#FF4D4F]" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={() => alert("🔗 Verified Candidate Dossier URL copied to clipboard!")}
            className="flex items-center gap-2 bg-[#FF4D4F] hover:bg-[#ff6b6d] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-[0_0_25px_rgba(255,77,79,0.4)]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Verified Report</span>
          </button>
        </div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-[#161616] border border-[#00D97E]/40 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <span className="text-xs font-mono font-bold text-[#8B8B8B] uppercase">OVERALL COMPOSITE INDEX</span>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-mono font-black text-white">94.2</span>
            <span className="text-lg font-bold text-[#00D97E]">Grade A+</span>
          </div>
          <span className="text-xs text-[#00D97E] font-medium">✓ Exceeded FAANG Staff Consensus Bar</span>
        </div>

        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-[#8B8B8B] uppercase">TECHNICAL ACCURACY</span>
          <div className="my-3 text-4xl font-mono font-bold text-white">96 / 100</div>
          <span className="text-xs text-white/70">Flawless lock ordering & atomic primitives</span>
        </div>

        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-[#8B8B8B] uppercase">COMMUNICATION CADENCE</span>
          <div className="my-3 text-4xl font-mono font-bold text-[#4DA3FF]">94 / 100</div>
          <span className="text-xs text-white/70">142 WPM • Clear architectural diction</span>
        </div>

        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <span className="text-xs font-mono font-bold text-[#8B8B8B] uppercase">CONFIDENCE & EXECUTIVE PRESENCE</span>
          <div className="my-3 text-4xl font-mono font-bold text-[#FFC857]">92 / 100</div>
          <span className="text-xs text-white/70">Assertive pushback on partition SLA</span>
        </div>
      </div>

      {/* Topic Analysis Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4 text-[#00D97E] font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" /> STRONGEST TOPIC DEMONSTRATED
          </div>
          <h3 className="text-xl font-bold text-white">Deadlock Prevention & Kernel Primitives</h3>
          <p className="text-xs text-[#8B8B8B] mt-2 leading-relaxed">
            Exhibited deep command over NUMA architecture trade-offs, spinlock CPU stall mechanics, and structured address hierarchical lock ordering.
          </p>
        </div>

        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4 text-[#FFC857] font-bold text-sm">
            <AlertTriangle className="w-5 h-5" /> WEAKEST TOPIC AREA
          </div>
          <h3 className="text-xl font-bold text-white">Distributed Lock Election Timeouts</h3>
          <p className="text-xs text-[#8B8B8B] mt-2 leading-relaxed">
            Minor hesitation when calculating exact millisecond thresholds during transatlantic fiber partition recovery under high network jitter.
          </p>
        </div>
      </div>

      {/* AI Summary & Recruiter Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
              <BookOpen className="w-4 h-4 text-[#FF4D4F]" /> RECOMMENDED LEARNING PATH
            </div>
            <ul className="space-y-3 text-xs text-white/80">
              <li className="p-3 bg-[#101010] rounded-xl border border-white/5 flex justify-between items-center">
                <span>⚡ 7-Day Precision Sprint: Advanced Distributed Caching</span>
                <span className="text-[#FF4D4F] font-bold">Start Sprint →</span>
              </li>
              <li className="p-3 bg-[#101010] rounded-xl border border-white/5 flex justify-between items-center">
                <span>🗺️ 30-Day Staff Deep Dive: Multi-Region Consensus</span>
                <span className="text-[#00D97E] font-bold">Enrolled ✓</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
            <UserCheck className="w-4 h-4 text-[#4DA3FF]" /> RECRUITER COMMITTEE FEEDBACK
          </div>
          <p className="text-xs text-white/80 leading-relaxed bg-[#101010] p-4 rounded-xl border border-white/5">
            "Candidate displayed executive readiness for Google Cloud L6 team leadership. Highly recommended for final loop offer generation with top-tier compensation package."
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 bg-[#181818] hover:bg-white/10 border border-white/10 text-white font-bold text-xs px-6 py-3 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4 text-[#FF4D4F]" />
          <span>Launch Another Executive Interview Session</span>
        </button>
      </div>
    </motion.div>
  );
};
