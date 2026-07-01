import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Sliders, Lock, Cpu, Eye, Sparkles } from 'lucide-react';
import { InterviewState, QuestionNode } from '../types';

interface LeftPanelProps {
  currentQuestion: QuestionNode;
  questionIndex: number;
  totalQuestions: number;
  interviewState: InterviewState;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  interviewState
}) => {
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [bgBlur, setBgBlur] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  const isAiSpeaking = interviewState === 'ai_speaking';
  const isUserSpeaking = interviewState === 'user_speaking';

  return (
    <aside className="col-span-3 flex flex-col gap-3.5 h-full min-h-0 overflow-hidden select-none">
      {/* AI INTERVIEWER POD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-[#161616] border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-xl min-h-0"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FF4D4F]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#4DA3FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00D97E] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-white/80">
              AI INTERVIEWER • OPENAI VOICE
            </span>
          </div>
          <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[#4DA3FF] font-semibold">
            FAANG L6 RIG
          </span>
        </div>

        {/* Center: FaceTime Style Avatar Core */}
        <div className="flex-1 flex flex-col items-center justify-center py-2 z-10">
          <div className="relative flex items-center justify-center">
            {/* Outer Pulse Rings */}
            <motion.div
              animate={{
                scale: isAiSpeaking ? [1, 1.35, 1] : [1, 1.08, 1],
                opacity: isAiSpeaking ? [0.4, 0.8, 0.4] : [0.15, 0.3, 0.15],
              }}
              transition={{ repeat: Infinity, duration: isAiSpeaking ? 1.2 : 3, ease: 'easeInOut' }}
              className="absolute w-40 h-40 rounded-full border border-[#FF4D4F]/40 bg-[#FF4D4F]/5"
            />
            <motion.div
              animate={{
                scale: isAiSpeaking ? [1.1, 1.5, 1.1] : [1.02, 1.15, 1.02],
                opacity: isAiSpeaking ? [0.2, 0.6, 0.2] : [0.08, 0.2, 0.08],
              }}
              transition={{ repeat: Infinity, duration: isAiSpeaking ? 1.5 : 4, ease: 'easeInOut' }}
              className="absolute w-48 h-48 rounded-full border border-[#FF4D4F]/20"
            />

            {/* Core Avatar Sphere */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#1c1c1c] via-[#101010] to-[#080808] border-2 border-white/15 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,77,79,0.25)] group">
              <div className="w-16 h-16 rounded-full bg-[#FF4D4F]/10 flex items-center justify-center border border-[#FF4D4F]/30">
                <Sparkles className="w-8 h-8 text-[#FF4D4F] animate-pulse" />
              </div>

              {/* Status Pill on Avatar */}
              <div className="absolute -bottom-2 bg-[#101010] border border-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md">
                {isAiSpeaking ? 'Speaking...' : isUserSpeaking ? 'Listening...' : 'Thinking...'}
              </div>
            </div>
          </div>

          <h3 className="mt-5 text-sm font-extrabold text-white tracking-tight">Elena Vance</h3>
          <p className="text-[11px] text-[#8B8B8B] font-medium">Principal Evaluator • Google OS Track</p>

          {/* Voice Waveform Bars */}
          <div className="flex items-center gap-1.5 h-6 mt-3">
            {[0.8, 1.4, 0.6, 1.8, 1.1, 1.6, 0.9, 1.3, 0.7].map((base, idx) => (
              <motion.span
                key={idx}
                animate={{
                  height: isAiSpeaking
                    ? [8, Math.min(24, 8 * base * 2), 8]
                    : isUserSpeaking
                    ? [4, 10, 4]
                    : [4, 6, 4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isAiSpeaking ? 0.4 + idx * 0.08 : 2,
                  ease: 'easeInOut',
                }}
                className="w-1 bg-[#FF4D4F] rounded-full opacity-85"
              />
            ))}
          </div>
        </div>

        {/* Bottom: Interview Track Information Box */}
        <div className="bg-[#101010] border border-white/10 rounded-xl p-3 z-10 flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[#8B8B8B] font-medium">Target Level</span>
            <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-[11px]">Google Staff Engineer</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8B8B8B]">Track / Domain</span>
            <span className="font-semibold text-white/90">{currentQuestion.track}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8B8B8B]">Current Question</span>
            <span className="font-mono font-bold text-[#FF4D4F]">Question {questionIndex} / {totalQuestions}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/5">
            <span className="text-[#8B8B8B]">Active Topic</span>
            <span className="font-bold text-[#00D97E] text-[11px] truncate max-w-[150px]">{currentQuestion.topic}</span>
          </div>
        </div>
      </motion.div>

      {/* CANDIDATE TELEMETRY & CAMERA RIG */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161616] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-3 shrink-0 shadow-lg"
      >
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-mono font-bold text-white/70 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#4DA3FF]" /> CANDIDATE NEURAL RIG
          </span>
          <span className="text-[10px] font-mono text-[#00D97E] bg-[#00D97E]/10 border border-[#00D97E]/30 px-2 py-0.5 rounded">
            60 FPS ENCRYPTED
          </span>
        </div>

        {/* Live Camera Preview Box */}
        <div className="relative h-32 bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center group">
          {camActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#181818] to-[#080808]">
              {/* Simulated Silhouette / Mesh */}
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1.5 shadow-inner">
                <Eye className="w-6 h-6 text-[#00D97E] animate-pulse" />
              </div>
              <span className="text-[11px] font-semibold text-white/80">Mirror Preview Active</span>
              <span className="text-[9px] font-mono text-[#8B8B8B]">Eye Contact: 94% • Pose: Centered</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-[#8B8B8B] gap-1">
              <VideoOff className="w-6 h-6 text-white/30" />
              <span className="text-xs">Camera Feed Paused</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-white/80 border border-white/10">
              {bgBlur ? '✓ Blur' : 'No Blur'}
            </span>
            <span className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-[#00D97E] border border-white/10">
              {noiseSuppression ? '✓ Noise Suppr.' : 'Raw Audio'}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              onClick={() => setCamActive(!camActive)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 transition"
              title="Toggle Camera"
            >
              {camActive ? <Video className="w-3.5 h-3.5 text-white" /> : <VideoOff className="w-3.5 h-3.5 text-[#FF4D4F]" />}
            </button>
            <button
              onClick={() => setMicActive(!micActive)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 transition"
              title="Toggle Mic"
            >
              {micActive ? <Mic className="w-3.5 h-3.5 text-white" /> : <MicOff className="w-3.5 h-3.5 text-[#FF4D4F]" />}
            </button>
          </div>
        </div>

        {/* Hardware Calibration Selectors */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <span className="text-[#8B8B8B] font-mono block mb-1">MIC HARDWARE</span>
            <select className="w-full bg-[#101010] border border-white/10 rounded-lg px-2 py-1 text-white truncate focus:outline-none focus:border-[#FF4D4F]">
              <option>Shure SM7B USB Rig</option>
              <option>MacBook Pro Built-in</option>
            </select>
          </div>
          <div>
            <span className="text-[#8B8B8B] font-mono block mb-1">CAMERA RIG</span>
            <select className="w-full bg-[#101010] border border-white/10 rounded-lg px-2 py-1 text-white truncate focus:outline-none focus:border-[#FF4D4F]">
              <option>Logitech Brio 4K Neural</option>
              <option>FaceTime HD Camera</option>
            </select>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
