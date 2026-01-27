# 🏗️ Coding Arena Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SKILLFORGE DASHBOARD                         │
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐            │
│  │   Dashboard  │   │ Skill Gap    │   │   Mock       │            │
│  │              │   │  Analyzer    │   │  Interview   │            │
│  └──────────────┘   └──────────────┘   └──────────────┘            │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                 DSA PRACTICE ARENA (New!)                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  Topics Grid (Arrays, Strings, Trees, DP, etc.)         │ │ │
│  │  │  [Click Problem] ───────────────────────┐               │ │ │
│  │  └──────────────────────────────────────────┼───────────────┘ │ │
│  └─────────────────────────────────────────────┼─────────────────┘ │
└─────────────────────────────────────────────────┼───────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FULL-SCREEN CODING ARENA                         │
├─────────────────────────────────────────────────────────────────────┤
│  Navigation Bar                                                      │
│  [← Back] | Problem Title | [Reset] [Save Draft]                   │
├──────────────┬────────────────────────────┬─────────────────────────┤
│              │                            │                         │
│  LEFT PANEL  │      CENTER PANEL          │    RIGHT PANEL          │
│  (Problem)   │     (Code Editor)          │    (Execution + AI)     │
│              │                            │                         │
│ ┌──────────┐ │ ┌────────────────────────┐ │ ┌─────────────────────┐│
│ │Description│ │ │ Language: [Python ▼] │ │ │[Test] [Output] [AI]││
│ │           │ │ ├────────────────────────┤ │ ├─────────────────────┤│
│ │Examples   │ │ │                        │ │ │                     ││
│ │           │ │ │  CODE EDITOR AREA      │ │ │  Test Cases         ││
│ │Constraints│ │ │  (contenteditable)     │ │ │  OR                 ││
│ │           │ │ │  - Tab indentation     │ │ │  Execution Output   ││
│ │Complexity │ │ │  - Monospace font      │ │ │  OR                 ││
│ │ O(n)      │ │ │  - Auto-save           │ │ │  AI Mentor Chat     ││
│ │           │ │ │                        │ │ │                     ││
│ └──────────┘ │ ├────────────────────────┤ │ └─────────────────────┘│
│              │ │ [▶ Run] [✓ Submit]     │ │                         │
│              │ └────────────────────────┘ │                         │
└──────────────┴────────────────────────────┴─────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CODING ARENA MODULE                           │
│                         (IIFE Pattern)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ Problem Manager│  │  Code Editor   │  │ Test Executor  │        │
│  ├────────────────┤  ├────────────────┤  ├────────────────┤        │
│  │ - Load problem │  │ - Multi-lang   │  │ - Run tests    │        │
│  │ - Convert fmt  │  │ - Templates    │  │ - Status check │        │
│  │ - Render UI    │  │ - Tab indent   │  │ - Perf stats   │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   AI Mentor    │  │ Progress Track │  │ Event Handlers │        │
│  ├────────────────┤  ├────────────────┤  ├────────────────┤        │
│  │ - 4 modes      │  │ - Attempts     │  │ - Click events │        │
│  │ - Hint system  │  │ - Time track   │  │ - Key handlers │        │
│  │ - Chat UI      │  │ - Mistakes log │  │ - Tab switches │        │
│  │ - Knowledge DB │  │ - localStorage │  │ - AI input     │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Opening a Problem

```
User clicks problem in practice page
         │
         ▼
enhanced-flows.js: openProblemModal(problemId)
         │
         ▼
Check if window.CodingArena exists
         │
    ┌────┴────┐
    │ YES     │ NO
    ▼         ▼
Launch Arena  Show Modal (fallback)
         │
         ▼
coding-arena.js: openProblem(problemId)
         │
         ├──> Find problem in window.DSA_TOPICS
         ├──> OR use built-in problems database
         ├──> Convert to arena format if needed
         │
         ▼
renderProblemDetails()
loadCodeTemplate()
renderTestCases()
initAIAssistant()
         │
         ▼
Arena displayed (full-screen)
```

### Code Execution Flow

```
User clicks "Run Code"
         │
         ▼
runCode() function
         │
         ├──> Validate code exists
         ├──> Update status: "Running..."
         ├──> executeTestCases() (simulated)
         │         │
         │         ├──> Loop through test cases
         │         ├──> Simulate execution (1 sec delay)
         │         └──> Return results array
         │
         ▼
displayTestResults()
         │
         ├──> Show passed/failed count
         ├──> List each test case result
         └──> Update performance stats
         │
         ▼
All passed? → updateStatus("Accepted")
Some failed? → updateStatus("Wrong Answer")
Error? → updateStatus("Runtime Error")
```

### AI Mentor Interaction

```
User clicks "Get a Hint"
         │
         ▼
handleQuickAction('hint')
         │
         ├──> setAIMode('hint')
         └──> sendPredefinedMessage("Can you give me a hint?")
         │
         ▼
sendAIMessage()
         │
         ├──> Add user message to chat
         └──> generateAIResponse(message, 'hint')
         │
         ▼
getHint(knowledge)
         │
         ├──> Check hintLevel (0, 1, 2)
         ├──> Return progressively deeper hints
         └──> Increment hintLevel
         │
         ▼
addAIMessage('assistant', hintContent)
         │
         ▼
Display in chat UI with animation
```

### Progress Tracking

```
User submits solution
         │
         ▼
submitCode()
         │
         ├──> Run all test cases
         ├──> Check if all passed
         │
         ▼
All passed?
    │
    ├─ YES → trackProgress('solved')
    │           │
    │           ├──> Update localStorage.codingProgress
    │           ├──> Increment attempt count
    │           ├──> Log mistakes detected
    │           ├──> Store total time spent
    │           └──> Mark problem as solved
    │
    └─ NO → trackProgress('attempted')
                │
                └──> Save attempt without solved flag
```

## File Dependencies

```
index.html
    │
    ├──> styles.css (base styles, variables)
    ├──> coding-arena-styles.css (arena-specific)
    ├──> enhanced-flows.js (practice page, DSA_TOPICS)
    ├──> mock-interview.js (mock interview system)
    ├──> coding-arena.js (arena logic) ← NEW
    └──> app.js (main app navigation)
```

## Integration Points

### With Practice Page
```
┌─────────────────────┐
│  enhanced-flows.js  │
├─────────────────────┤
│ DSA_TOPICS = {...}  │ ─┐
│                     │  │
│ renderPractice()    │  │  Exposed via
│ openProblemModal()  │  │  window.DSA_TOPICS
│                     │  │
└─────────────────────┘  │
                         │
          ┌──────────────┘
          │
          ▼
┌─────────────────────┐
│  coding-arena.js    │
├─────────────────────┤
│ openProblem(id) {   │
│   problem =         │
│   window.DSA_TOPICS │
│ }                   │
└─────────────────────┘
```

### With Skill Gap Analyzer (Future)
```
┌─────────────────────┐
│  coding-arena.js    │
├─────────────────────┤
│ trackProgress() {   │
│   mistakes = [...]  │
│   time = ...        │
│   localStorage.set()│
│ }                   │
└─────────────────────┘
          │
          │ localStorage
          │
          ▼
┌─────────────────────┐
│ Skill Gap Analyzer  │
├─────────────────────┤
│ analyzeSkillGap() { │
│   progress =        │
│   localStorage.get()│
│   → Identify weak   │
│      areas based on │
│      coding mistakes│
│ }                   │
└─────────────────────┘
```

## State Management

```javascript
// Global State (coding-arena.js)
{
    currentProblem: {
        id: 'two-sum',
        title: '1. Two Sum',
        difficulty: 'easy',
        ...
    },
    currentLanguage: 'python',
    currentCode: 'def twoSum(...)...',
    testResults: [
        { passed: true, runtime: 45 },
        { passed: false, runtime: 52 }
    ],
    aiMode: 'hint',
    hintLevel: 2,
    chatHistory: [
        { role: 'user', content: '...' },
        { role: 'assistant', content: '...' }
    ],
    attemptCount: 3,
    mistakePatterns: ['nested-loops', 'off-by-one']
}
```

## localStorage Schema

```javascript
// localStorage Keys
{
    'codingDrafts': {
        'two-sum': {
            code: 'def twoSum(nums, target):\n    ...',
            language: 'python',
            timestamp: 1234567890
        },
        'valid-parentheses': { ... }
    },
    
    'codingProgress': {
        'two-sum': {
            attempts: 3,
            solved: true,
            mistakes: ['nested-loops-pattern'],
            totalTime: 180000  // milliseconds
        }
    },
    
    'solvedProblems': ['two-sum', 'valid-parentheses'],
    
    'practiceProgress': {
        'java': {
            'two-sum': 'solved',
            'three-sum': 'attempted'
        }
    }
}
```

## API Surface

### Public Methods (window.CodingArena)
```javascript
CodingArena.init()
    // Initialize arena, setup event listeners

CodingArena.openProblem(problemId)
    // Open arena with specific problem

CodingArena.closeArena()
    // Close arena, return to practice page

CodingArena.problems
    // Built-in problems database
```

### Internal Methods (private)
```javascript
renderProblemDetails(problem)
loadCodeTemplate(language)
handleCodeInput(event)
runCode()
submitCode()
executeTestCases(code, testCases)
initAIAssistant()
sendAIMessage()
generateAIResponse(message, mode)
trackProgress(outcome)
saveProgress()
```

## CSS Architecture

```
coding-arena-styles.css
    ├─ Arena Container (.coding-arena)
    ├─ Navigation Bar (.arena-navbar)
    ├─ Three-Panel Layout
    │   ├─ Left Panel (.arena-left-panel)
    │   ├─ Center Panel (.arena-center-panel)
    │   └─ Right Panel (.arena-right-panel)
    ├─ Code Editor (.code-editor)
    ├─ Test Cases (.testcases-list)
    ├─ Output Console (.output-console)
    ├─ AI Assistant (.ai-assistant-container)
    │   ├─ Chat Messages (.ai-messages)
    │   ├─ Mode Selector (.ai-mode-selector)
    │   └─ Input Area (.ai-input-area)
    ├─ Resize Handles (.resize-handle)
    └─ Responsive (@media queries)
```

## Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTIONS                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Click Problem    →  openProblem()                           │
│  Type in Editor   →  handleCodeInput() → saveProgress()      │
│  Press Tab        →  handleCodeKeydown() → indent            │
│  Change Language  →  handleLanguageChange() → loadTemplate() │
│  Click Run        →  runCode() → executeTestCases()          │
│  Click Submit     →  submitCode() → trackProgress()          │
│  Switch Tab       →  switchTab() → show/hide content         │
│  Click AI Mode    →  setAIMode() → update UI                 │
│  Send AI Message  →  sendAIMessage() → generateAIResponse()  │
│  Click Quick Btn  →  handleQuickAction() → sendPredefined()  │
│  Click Back       →  closeArena() → show practice page       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Optimizations
- **Lazy Loading**: Problems loaded on-demand
- **LocalStorage**: Client-side caching, no server round-trips
- **CSS Animations**: Hardware-accelerated transforms
- **Event Delegation**: Minimal event listeners
- **Debounced Auto-Save**: Save every 2 seconds, not every keystroke

### Bottlenecks
- **ContentEditable**: Native browser element (fast)
- **Test Execution**: 1 second simulated delay (realistic)
- **AI Responses**: 500ms delay (simulated thinking time)

## Security Considerations

### Current Implementation
- ✅ No server communication (offline-first)
- ✅ No user data transmitted
- ✅ LocalStorage only (browser sandboxed)
- ⚠️ Code not executed (simulated results)

### Future Real Execution
- ⚠️ Need sandboxed environment (Docker, VM)
- ⚠️ Resource limits (CPU, memory, time)
- ⚠️ Input validation (prevent malicious code)
- ⚠️ Output sanitization (XSS prevention)

---

## Summary

The Coding Arena is a **modular, self-contained system** that integrates seamlessly with SkillForge's practice page. It uses:

- **IIFE pattern** for encapsulation
- **localStorage** for persistence
- **ContentEditable** for code editing
- **CSS Grid/Flexbox** for layout
- **Event-driven architecture** for interactions
- **Simulated execution** for instant feedback

All components communicate through well-defined interfaces, making it easy to extend, test, and maintain. 🎯
