import React from 'react';
import { Shield, Radio, Clock, PhoneOff } from 'lucide-react';
import { TrackName } from '../types';

interface NavbarProps {
  selectedTrack: TrackName;
  onSelectTrack: (track: TrackName) => void;
  sessionTime: string;
  onEndInterview: () => void;
  isEnded: boolean;
}

const TRACKS: TrackName[] = [
  'Operating Systems',
  'Distributed Systems',
  'System Design',
  'Computer Networks',
  'DBMS',
  'Software Engineering',
  'Low Level Design',
  'High Level Design',
  'Cloud & AWS',
  'Kubernetes & Docker',
  'Behavioral & Leadership'
];

export const Navbar: React.FC<NavbarProps> = ({
  selectedTrack,
  onSelectTrack,
  sessionTime,
  onEndInterview,
  isEnded
}) => {
  return (
    <header className="h-14 bg-[#101010]/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-40">
      {/* Left: Brand & Track Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4D4F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4D4F]"></span>
          </span>
          <span className="font-extrabold tracking-tight text-white text-base">WAR ROOM <span className="text-[#FF4D4F] font-mono text-xs ml-1">V2</span></span>
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        <div className="flex items-center gap-2">
          <select
            value={selectedTrack}
            onChange={(e) => onSelectTrack(e.target.value as TrackName)}
            disabled={isEnded}
            className="bg-[#181818] border border-white/10 rounded-lg px-3 py-1 text-xs font-semibold text-white/90 focus:outline-none focus:border-[#FF4D4F] transition cursor-pointer disabled:opacity-50"
          >
            <option value="Operating Systems">Operating Systems (Senior)</option>
            <option value="Distributed Systems">Distributed Systems (Staff L6)</option>
            <option value="System Design">System Design (Principal L7)</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="DBMS">DBMS & Storage Architecture</option>
            <option value="Software Engineering">Software Engineering Architecture</option>
            <option value="Low Level Design">Low Level Design & OOP</option>
            <option value="Cloud & AWS">Cloud Infrastructure & AWS</option>
            <option value="Kubernetes & Docker">Kubernetes & Container Orchestration</option>
            <option value="Behavioral & Leadership">Behavioral & Executive Leadership</option>
          </select>
        </div>
      </div>

      {/* Center: Pipeline & Telemetry Status */}
      <div className="hidden md:flex items-center gap-3 bg-[#161616] border border-white/10 px-3.5 py-1 rounded-full text-[11px] font-mono text-white/70 shadow-inner">
        <Shield className="w-3.5 h-3.5 text-[#00D97E]" />
        <span>12ms ENCRYPTED TELEMETRY</span>
        <span className="text-white/20">•</span>
        <Radio className="w-3.5 h-3.5 text-[#4DA3FF] animate-pulse" />
        <span className="text-[#4DA3FF] font-semibold">NEURAL VOICE ENGINE ACTIVE</span>
      </div>

      {/* Right: Timer & Action */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#161616] border border-white/10 px-3 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-white/50" />
          <span className="font-mono text-xs font-bold tracking-wider text-white">{sessionTime}</span>
        </div>

        {!isEnded ? (
          <button
            onClick={onEndInterview}
            className="group flex items-center gap-2 bg-[#FF4D4F] hover:bg-[#ff6b6d] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(255,77,79,0.3)] hover:shadow-[0_0_30px_rgba(255,77,79,0.5)] active:scale-95"
          >
            <PhoneOff className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
            <span>End Interview</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-[#00D97E] bg-[#00D97E]/10 border border-[#00D97E]/30 px-3 py-1 rounded-lg">
            ✓ EVALUATION COMPLETED
          </span>
        )}
      </div>
    </header>
  );
};
