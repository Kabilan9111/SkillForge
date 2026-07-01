import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LeftPanel } from './components/LeftPanel';
import { CenterPanel } from './components/CenterPanel';
import { RightPanel } from './components/RightPanel';
import { FloatingCoach } from './components/FloatingCoach';
import { ReportScreen } from './components/ReportScreen';
import { MOCK_QUESTIONS } from './data/mockQuestions';
import { InterviewState, TrackName } from './types';

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<TrackName>('Operating Systems');
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [followUpIdx, setFollowUpIdx] = useState<number>(0);
  const [interviewState, setInterviewState] = useState<InterviewState>('ai_speaking');
  const [secondsElapsed, setSecondsElapsed] = useState<number>(1838); // 30:38 start time simulation

  // Timer simulation
  useEffect(() => {
    if (interviewState !== 'ended') {
      const timer = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [interviewState]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Find question for current track
  const activeQuestion = MOCK_QUESTIONS.find(q => q.track === selectedTrack) || MOCK_QUESTIONS[0];

  const handleSelectTrack = (track: TrackName) => {
    setSelectedTrack(track);
    setFollowUpIdx(0);
    setInterviewState('ai_speaking');
  };

  const handleAdvanceFollowUp = () => {
    if (followUpIdx < activeQuestion.followUps.length) {
      setFollowUpIdx(prev => prev + 1);
    } else {
      // Cycle or conclude
      setFollowUpIdx(0);
    }
  };

  const handleCoachAction = (action: 'hint' | 'repeat' | 'skip') => {
    if (action === 'skip') {
      handleAdvanceFollowUp();
    } else if (action === 'repeat') {
      setInterviewState('ai_speaking');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden selection:bg-[#FF4D4F] selection:text-white">
      {/* Executive Top Bar */}
      <Navbar
        selectedTrack={selectedTrack}
        onSelectTrack={handleSelectTrack}
        sessionTime={formatTime(secondsElapsed)}
        onEndInterview={() => setInterviewState('ended')}
        isEnded={interviewState === 'ended'}
      />

      {/* Main Viewport Stage */}
      {interviewState === 'ended' ? (
        <ReportScreen
          track={selectedTrack}
          onRestart={() => {
            setInterviewState('ai_speaking');
            setSecondsElapsed(0);
            setFollowUpIdx(0);
          }}
        />
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3.5 p-3.5 min-h-0 overflow-hidden relative">
          {/* Left: AI Avatar & Candidate Neural Rig (3 Cols) */}
          <LeftPanel
            currentQuestion={activeQuestion}
            questionIndex={1}
            totalQuestions={10}
            interviewState={interviewState}
          />

          {/* Center: Conversational Voice Core (6 Cols) */}
          <CenterPanel
            currentQuestion={activeQuestion}
            interviewState={interviewState}
            onSetState={setInterviewState}
            followUpIndex={followUpIdx}
            onAdvanceFollowUp={handleAdvanceFollowUp}
          />

          {/* Right: Continuous Real-Time Evaluation Telemetry (3 Cols) */}
          <RightPanel interviewState={interviewState} />

          {/* Floating Grammarly-style AI Coach Pod */}
          <FloatingCoach onTriggerAction={handleCoachAction} />
        </div>
      )}
    </div>
  );
}
