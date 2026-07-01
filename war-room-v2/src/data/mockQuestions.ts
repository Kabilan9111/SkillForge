import { QuestionNode } from '../types';

export const MOCK_QUESTIONS: QuestionNode[] = [
  {
    id: 1,
    track: 'Operating Systems',
    difficulty: 'Senior',
    topic: 'Deadlock Prevention & Concurrency',
    prompt: "We have two worker threads acquiring locks A and B in reverse order under high load. How do you prevent deadlock without sacrificing concurrency at edge scale?",
    aiInitialAudioText: "Welcome to Google Cloud Infrastructure. Let's start with Operating Systems concurrency. Suppose two high-throughput threads acquire resource locks A and B in opposite sequence. How would you architect a deadlock prevention mechanism without degrading throughput?",
    userSampleAnswer: "To avoid circular wait without global locking overhead, I enforce strict hierarchical lock ordering across memory addresses or utilize non-blocking try-lock primitives with exponential backoff and jitter.",
    followUps: [
      {
        question: "What happens to system latency if hardware interrupts are disabled during lock contention?",
        aiComment: "Insightful response on lock ordering. Now, let's explore kernel primitives. What happens if hardware interrupts are disabled during lock acquisition?"
      },
      {
        question: "Can you compare how Linux CFS vs Windows NT scheduler handle thread priority inversion under heavy mutex contention?",
        aiComment: "Exactly right about CPU stall. Next question: compare how Linux CFS and the Windows NT scheduler resolve priority inversion when a low-priority thread holds our mutex."
      },
      {
        question: "What are the memory footprint and cache invalidation trade-offs when using spinlocks vs sleeping mutexes on a 128-core NUMA system?",
        aiComment: "Great distinction between priority inheritance protocols. Finally, let's analyze hardware cache coherency: what are the NUMA trade-offs of spinlocks versus futexes?"
      }
    ]
  },
  {
    id: 2,
    track: 'Distributed Systems',
    difficulty: 'Staff',
    topic: 'Global Rate Limiting & Consensus',
    prompt: "Design a high-throughput distributed rate limiter for 100M requests/sec across global edge locations with sub-10ms SLA.",
    aiInitialAudioText: "Let's pivot to Distributed Systems at Staff level. How would you design an edge rate limiter handling 100 million requests per second globally while keeping latency under 10 milliseconds?",
    userSampleAnswer: "Synchronous quorum consensus across regions violates our 10ms SLA. I architect local L1 edge memory token buckets coupled with background CRDT gossip synchronization to guarantee eventual consistency without blocking incoming requests.",
    followUps: [
      {
        question: "How do you handle split-brain Redis cluster failover without dropping or doubling tokens during a cross-continental network split?",
        aiComment: "Flawless choice using CRDTs. But what if a transatlantic fiber cut partitions our European edge nodes? How do you prevent token duplication?"
      },
      {
        question: "Compare Sliding Window Log versus Token Bucket memory overhead when tracking 50 million active IP addresses at edge proxies.",
        aiComment: "Spot on regarding fencing tokens. Now let's calculate memory costs: compare Sliding Window Log versus Token Bucket memory requirements at scale."
      }
    ]
  },
  {
    id: 3,
    track: 'System Design',
    difficulty: 'Principal',
    topic: 'Multi-Region Active-Active Database',
    prompt: "Architect an Active-Active multi-region database consensus tier for payment processing with zero data loss under zone failure.",
    aiInitialAudioText: "For our Principal design round, let's look at financial ledger persistence. Architect an active-active multi-region database layer for Stripe payments guaranteeing zero data loss under total zone failure.",
    userSampleAnswer: "For financial ledgers, we require strict serializability. I utilize Spanner-style TrueTime atomic clocks with Paxos consensus groups sharded by merchant ID across distinct failure domains.",
    followUps: [
      {
        question: "How does TrueTime clock uncertainty window affect commit latency during global leap second adjustments?",
        aiComment: "TrueTime and Paxos are the industry benchmark. Let's interrogate the edge cases: how does atomic clock drift affect commit latency during a leap second?"
      }
    ]
  }
];
