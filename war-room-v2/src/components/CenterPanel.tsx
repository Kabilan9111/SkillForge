import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, RotateCcw, HelpCircle, Pause, Play, Sparkles, Radio } from 'lucide-react';
import { InterviewState, QuestionNode } from '../types';

interface CenterPanelProps {
  currentQuestion: QuestionNode;
  interviewState: InterviewState;
  onSetState: (state: InterviewState) => void;
  followUpIndex: number;
  onAdvanceFollowUp: () => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  currentQuestion,
  interviewState,
  onSetState,
  followUpIndex,
  onAdvanceFollowUp
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [streamingCaption, setStreamingCaption] = useState<string>('');
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([]);

  const currentPrompt = followUpIndex === 0
    ? currentQuestion.prompt
    : currentQuestion.followUps[followUpIndex - 1]?.question || currentQuestion.prompt;

  const aiAudioText = followUpIndex === 0
    ? currentQuestion.aiInitialAudioText
    : currentQuestion.followUps[followUpIndex - 1]?.question || "";

  // Initialize transcript when question changes
  useEffect(() => {
    setTranscriptHistory([
      { sender: 'ai', text: aiAudioText, time: '00:14' }
    ]);
  }, [currentQuestion.id, followUpIndex]);

  // Handle voice simulation when user taps speak
  const handleToggleVoiceStream = () => {
    if (interviewState === 'ai_speaking' || interviewState === 'idle') {
      onSetState('user_speaking');
      // Simulate real-time streaming speech
      const sample = currentQuestion.userSampleAnswer;
      let i = 0;
      setStreamingCaption('');
      const interval = setInterval(() => {
        i += 3;
        if (i <= sample.length) {
          setStreamingCaption(sample.substring(0, i));
        } else {
          clearInterval(interval);
          setTranscriptHistory(prev => [...prev, { sender: 'user', text: sample, time: '01:05' }]);
          onSetState('ai_thinking');
          setTimeout(() => {
            onAdvanceFollowUp();
            onSetState('ai_speaking');
          }, 2000);
        }
      }, 50);
    } else if (interviewState === 'user_speaking') {
      onSetState('ai_thinking');
      setTimeout(() => {
        onAdvanceFollowUp();
        onSetState('ai_speaking');
      }, 1500);
    }
  };

  return (
    <main className="col-span-6 flex flex-col gap-4 h-full min-h-0 overflow-hidden select-none">
      {/* 1. CINEMATIC QUESTION HEADER STAGE */}
      <motion.div
        key={currentPrompt}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#161616] border border-white/10 rounded-2xl p-6 relative overflow-hidden shrink-0 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FF4D4F] flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> PHASE {followUpIndex + 1}: INTERROGATION STAGE
          </span>
          <span className="text-xs font-mono text-[#8B8B8B] bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            VOICE FIRST • NO IDE
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-white leading-relaxed tracking-tight">
          "{currentPrompt}"
        </h1>
      </motion.div>

      {/* 2. LIVE VOICE CONVERSATION STREAM */}
      <div className="flex-1 bg-[#101010] border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-0 relative overflow-hidden shadow-inner">
        {/* Ambient background watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <Radio className="w-96 h-96 text-white" />
        </div>

        {/* Conversation Transcript Stream */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 z-10">
          <AnimatePresence>
            {transcriptHistory.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col max-w-[85%] ${item.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-[#8B8B8B]">
                  <span>{item.sender === 'ai' ? '🤖 Elena Vance (AI)' : '🎙️ Candidate Voice'}</span>
                  <span>• {item.time}</span>
                </div>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    item.sender === 'ai'
                      ? 'bg-[#161616] border border-white/10 text-white/90 rounded-tl-none'
                      : 'bg-gradient-to-r from-[#FF4D4F]/20 to-[#FF4D4F]/10 border border-[#FF4D4F]/40 text-white font-medium rounded-tr-none'
                  }`}
                >
                  {item.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live Streaming User Speech Bubble */}
          {interviewState === 'user_speaking' && streamingCaption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-end items-end flex flex-col max-w-[85%]"
            >
              <span className="text-[11px] font-mono text-[#FF4D4F] mb-1 animate-pulse">🔴 Live Speech Recognition...</span>
              <div className="p-4 rounded-2xl rounded-tr-none bg-[#FF4D4F]/15 border border-[#FF4D4F] text-white text-sm font-medium leading-relaxed">
                {streamingCaption}
                <span className="inline-block w-2 h-4 bg-[#FF4D4F] ml-1 animate-ping" />
              </div>
            </motion.div>
          )}

          {/* AI Thinking Animation */}
          {interviewState === 'ai_thinking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="self-start flex items-center gap-3 p-3.5 bg-[#161616] border border-white/10 rounded-2xl text-xs text-[#8B8B8B]"
            >
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#4DA3FF] animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#00D97E] animate-bounce [animation-delay:0.3s]" />
              </div>
              <span>Elena Vance is synthesizing neural architectural evaluation & generating follow-up...</span>
            </motion.div>
          )}
        </div>

        {/* 3. EXECUTIVE VOICE CONTROL RIG */}
        <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-3 z-10 shrink-0">
          {/* Main Voice Orb Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsPaused(!isPaused);
              }}
              className="p-3 rounded-xl bg-[#181818] hover:bg-white/10 border border-white/10 text-white/80 transition"
              title="Pause Interview"
            >
              {isPaused ? <Play className="w-4 h-4 text-[#00D97E]" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleVoiceStream}
              disabled={isPaused}
              className={`relative group flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 shadow-xl ${
                interviewState === 'user_speaking'
                  ? 'bg-gradient-to-r from-[#FF4D4F] to-[#ff6b6d] text-white shadow-[0_0_35px_rgba(255,77,79,0.6)] animate-pulse'
                  : 'bg-gradient-to-r from-[#181818] to-[#222] hover:from-[#222] hover:to-[#2a2a2a] border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
              }`}
            >
              <Mic className={`w-5 h-5 mr-2.5 transition-transform group-hover:scale-110 ${interviewState === 'user_speaking' ? 'text-white animate-bounce' : 'text-[#FF4D4F]'}`} />
              <span>
                {interviewState === 'user_speaking'
                  ? 'Active Voice Stream • Tap to Conclude'
                  : 'Tap to Answer by Voice'}
              </span>
            </button>

            <button
              onClick={() => alert("Replaying high-fidelity AI voice prompt...")}
              className="p-3 rounded-xl bg-[#181818] hover:bg-white/10 border border-white/10 text-white/80 transition"
              title="Repeat Question"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => alert("Asking AI interviewer for clarifying constraints...")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#4DA3FF]" />
              <span>Ask Clarification</span>
            </button>
            <button
              onClick={() => alert("AI repeating question with emphasized architectural trade-offs...")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#00D97E]" />
              <span>Replay Audio</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
