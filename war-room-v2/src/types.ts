export type InterviewState = 'idle' | 'ai_speaking' | 'user_speaking' | 'ai_thinking' | 'ended';

export type TrackName =
  | 'Operating Systems'
  | 'Computer Networks'
  | 'DBMS'
  | 'Digital Logic Design'
  | 'Computer Organization'
  | 'Software Engineering'
  | 'Compiler Design'
  | 'OOP'
  | 'System Design'
  | 'Low Level Design'
  | 'High Level Design'
  | 'Distributed Systems'
  | 'Cloud & AWS'
  | 'Kubernetes & Docker'
  | 'Behavioral & Leadership';

export interface QuestionNode {
  id: number;
  track: TrackName;
  difficulty: 'Senior' | 'Staff' | 'Principal';
  topic: string;
  prompt: string;
  aiInitialAudioText: string;
  userSampleAnswer: string;
  followUps: {
    question: string;
    aiComment: string;
  }[];
}
