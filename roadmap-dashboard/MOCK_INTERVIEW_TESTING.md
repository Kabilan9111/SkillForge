# Mock Interview Feature - Testing Guide

## Overview
The Mock Interview feature allows users to practice technical interviews in two phases:
- **Phase 1 (Text Round)**: 5 questions with text input
- **Phase 2 (Voice Round)**: 5 questions with voice input and speech recognition

## Prerequisites

### 1. Backend Setup
Make sure the backend server is running:
```bash
cd backend
npm start
```
Server should be running at `http://localhost:5000`

### 2. Browser Requirements
- **Chrome** or **Edge** (recommended for Web Speech API support)
- **Microphone permission** for voice recording
- **HTTPS or localhost** (Web Speech API requires secure context)

### 3. User Setup
Before starting a mock interview, you need:
- A selected career track (stored in `localStorage.selectedTrackId`)
- A user level (stored in `localStorage.currentUserLevel`)

## Testing Steps

### Step 1: Set Up Track and Level
Open the browser console (F12) and run:
```javascript
// Set a test track and level
localStorage.setItem('selectedTrackId', '1');
localStorage.setItem('selectedTrackName', 'Full-Stack Developer');
localStorage.setItem('currentUserLevel', 'Intermediate');
```

### Step 2: Navigate to Mock Interview Page
1. Open `index.html` in your browser
2. Click on "Mock Interview" in the navigation menu
3. You should see the start screen with:
   - Track name: "Full-Stack Developer"
   - Level: "Intermediate"
   - Start Interview button
   - Interview rules

### Step 3: Start Interview - Validation Test
**Test Case 1: Missing Track/Level**
```javascript
// Clear localStorage to test validation
localStorage.removeItem('selectedTrackId');
localStorage.removeItem('currentUserLevel');
```
- Click "Start Interview"
- Expected: Error message appears: "Please select a career track and complete a level assessment before starting the interview."

**Test Case 2: Valid Track/Level**
- Restore track/level (see Step 1)
- Click "Start Interview"
- Expected: Transitions to active screen, shows first question

### Step 4: Phase 1 (Text Round) Testing
**Question Display:**
- ✅ Question number shows (1/10)
- ✅ Phase badge shows "Text Round" (green)
- ✅ Question text is displayed
- ✅ Timer starts at 5:00 and counts down
- ✅ Progress bar shows 10% completion
- ✅ Text answer area is visible
- ✅ Voice answer area is hidden

**Answer Input:**
1. Type an answer in the text area (minimum 50 characters recommended)
2. Character count updates (e.g., "150/2000")
3. Click "Submit Text Answer"
4. Expected:
   - Timer stops
   - "Evaluating your answer..." loading message appears
   - Score bars animate with values (0-10)
   - Feedback text appears
   - "Next Question" button appears

**Navigation:**
- Click "Next Question"
- Expected: Moves to question 2/10, timer resets to 5:00

**Repeat for Questions 1-5:**
- Continue answering text questions
- After question 5, phase transition screen appears

### Step 5: Phase Transition Testing
After completing question 5:
- ✅ Phase transition modal appears
- ✅ Title: "Phase 2: Voice Round"
- ✅ Instructions for voice recording
- ✅ "Begin Voice Round" button

Click "Begin Voice Round":
- Expected: Question 6/10 appears with voice answer area

### Step 6: Phase 2 (Voice Round) Testing
**Question Display:**
- ✅ Question number shows (6/10)
- ✅ Phase badge shows "Voice Round" (red)
- ✅ Question is spoken aloud (text-to-speech)
- ✅ "Speak Question" button available for replay
- ✅ Text answer area is hidden
- ✅ Voice answer area is visible

**Microphone Permission:**
1. Click the microphone button (🎤)
2. Expected: Browser asks for microphone permission
3. Grant permission
4. Expected:
   - "Ready to record" → "Recording..."
   - Stop button (⏹) appears
   - Recording timer starts (00:00, 00:01, etc.)
   - Transcription preview shows "Listening..."

**Voice Recording:**
1. Speak your answer (e.g., "This is a test answer for the interview question")
2. Watch the transcription preview update in real-time
3. Click Stop button
4. Expected:
   - Recording stops
   - Transcription appears in preview
   - Audio playback controls appear
   - "Submit Voice Answer" button appears
   - "Re-record" button available

**Audio Playback:**
- Click play on the audio player
- Expected: Your recorded answer plays back

**Re-record (Optional):**
- Click "Re-record"
- Expected: Clears transcription and audio, allows new recording

**Submit Answer:**
- Click "Submit Voice Answer"
- Expected:
   - Timer stops
   - "Evaluating your answer..." appears
   - Score bars animate
   - Feedback text appears
   - **Feedback is spoken aloud** (text-to-speech)
   - "Next Question" button appears

**Repeat for Questions 6-10:**
- Continue answering voice questions
- After question 10, completion screen appears

### Step 7: Interview Completion Testing
After answering all 10 questions:
- ✅ Complete screen appears
- ✅ Final average score displayed (e.g., "7.5/10")
- ✅ Text round average (questions 1-5)
- ✅ Voice round average (questions 6-10)
- ✅ "Start New Interview" button
- ✅ "View Detailed Report" button (shows "coming soon" notification)

**Start New Interview:**
- Click "Start New Interview"
- Expected: Returns to start screen, ready for another session

### Step 8: Timer Expiration Testing
**Test Case: Let timer run out**
1. Start an interview
2. Do NOT submit an answer
3. Wait for timer to reach 0:00
4. Expected:
   - **Text Round**: Auto-submits empty answer, moves to next question
   - **Voice Round**: Stops recording if active, submits current transcription

### Step 9: Session Persistence Testing
**Test Case: Reload mid-interview**
1. Start an interview
2. Answer 2-3 questions
3. Refresh the page (F5)
4. Navigate back to Mock Interview page
5. Expected:
   - "Resume Interview" button appears
   - Click it to continue from where you left off

**Clear Session:**
```javascript
localStorage.removeItem('mockInterviewSession');
```

### Step 10: End Interview Early
1. Start an interview
2. Click "End Interview" button in the header
3. Expected:
   - Confirmation prompt: "Are you sure you want to end this interview?"
   - If confirmed: Returns to start screen, session cleared

## Backend API Testing

### Mock Interview Questions Endpoint
```bash
# Get interview questions
curl -X GET "http://localhost:5000/api/interview/questions?trackId=1&level=Intermediate"
```

Expected Response:
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "text": "What is the difference between == and === in JavaScript?",
      "type": "text",
      "difficulty": "easy"
    },
    // ... 9 more questions
  ]
}
```

### Answer Evaluation Endpoint
```bash
# Evaluate an answer
curl -X POST http://localhost:5000/api/interview/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": 1,
    "answer": "The === operator checks for strict equality...",
    "type": "text",
    "trackId": 1,
    "level": "Intermediate"
  }'
```

Expected Response:
```json
{
  "success": true,
  "scores": {
    "clarity": 8,
    "correctness": 9,
    "depth": 7,
    "confidence": 8,
    "communication": 8
  },
  "feedback": "Excellent answer! You demonstrated strong understanding...",
  "overallScore": 8.0
}
```

## Common Issues & Troubleshooting

### Issue 1: Microphone Not Working
- **Symptom**: No transcription appears while speaking
- **Solution**:
  1. Check browser permissions (chrome://settings/content/microphone)
  2. Ensure microphone is not muted
  3. Test in Chrome/Edge (Firefox has limited support)
  4. Use HTTPS or localhost (required for Web Speech API)

### Issue 2: Text-to-Speech Not Working
- **Symptom**: Questions/feedback not spoken aloud
- **Solution**:
  1. Check browser volume and system audio
  2. Open browser console and check for errors
  3. Test: `speechSynthesis.speak(new SpeechSynthesisUtterance('test'))`

### Issue 3: "Please select a career track" Error
- **Symptom**: Cannot start interview
- **Solution**: Set track and level in console (see Step 1)

### Issue 4: Questions Not Loading
- **Symptom**: Stuck on loading screen
- **Solution**:
  1. Check backend is running (`http://localhost:5000`)
  2. Check browser console for API errors
  3. Fallback questions should load if API fails

### Issue 5: Session Not Persisting
- **Symptom**: Progress lost after refresh
- **Solution**:
  1. Check localStorage is enabled
  2. Verify `mockInterviewSession` key exists
  3. Check browser console for storage errors

## Manual Checklist

Use this checklist to verify all features work:

### Start Screen
- [ ] Track name displays correctly
- [ ] Level displays correctly
- [ ] Start button works
- [ ] Resume button appears if session exists
- [ ] Validation error shows if track/level missing

### Text Round (Questions 1-5)
- [ ] Question displays correctly
- [ ] Timer counts down from 5:00
- [ ] Progress bar updates (10%, 20%, 30%, 40%, 50%)
- [ ] Text area accepts input
- [ ] Character count updates
- [ ] Submit button works
- [ ] Scores animate correctly
- [ ] Feedback displays
- [ ] Next button advances to next question

### Phase Transition
- [ ] Transition screen appears after question 5
- [ ] Instructions are clear
- [ ] "Begin Voice Round" button works

### Voice Round (Questions 6-10)
- [ ] Question is spoken aloud
- [ ] Microphone button requests permission
- [ ] Recording starts/stops correctly
- [ ] Transcription appears in real-time
- [ ] Audio playback works
- [ ] Re-record button clears and resets
- [ ] Submit button works
- [ ] Feedback is spoken aloud
- [ ] Progress bar updates (60%, 70%, 80%, 90%, 100%)

### Completion Screen
- [ ] Final scores display correctly
- [ ] Text/Voice averages are accurate
- [ ] "Start New Interview" resets properly
- [ ] "View Report" shows notification

### Edge Cases
- [ ] Timer expiration handled correctly
- [ ] Session persists after refresh
- [ ] End interview early works
- [ ] Multiple sessions can be completed
- [ ] Error messages are user-friendly

## Browser Console Commands

### Debug Current State
```javascript
// Check stored data
console.log('Track:', localStorage.getItem('selectedTrackId'));
console.log('Level:', localStorage.getItem('currentUserLevel'));
console.log('Session:', localStorage.getItem('mockInterviewSession'));

// Check if module loaded
console.log('MockInterview:', window.MockInterview);

// Manual init
MockInterview.init();
```

### Force Phase Transition
```javascript
// Manually trigger phase 2 (for testing)
// Note: This requires access to internal state
```

### Clear All Data
```javascript
// Reset everything
localStorage.removeItem('mockInterviewSession');
localStorage.removeItem('interviewReport');
location.reload();
```

## Performance Benchmarks

- **Question Load Time**: < 500ms (with API), instant (fallback)
- **Answer Evaluation**: 1-3 seconds (mock evaluation is instant)
- **Speech Recognition Latency**: Real-time (< 200ms)
- **Text-to-Speech Latency**: < 500ms

## Next Steps

After successful testing:
1. ✅ Implement backend API endpoints for real question generation
2. ✅ Add AI-powered answer evaluation
3. ✅ Create detailed report page
4. ✅ Add interview history/analytics
5. ✅ Implement difficulty adjustment based on performance
6. ✅ Add more question types (coding, system design, behavioral)
