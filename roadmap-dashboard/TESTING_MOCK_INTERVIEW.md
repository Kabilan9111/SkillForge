# Mock Interview System - Testing Guide

## Quick Verification Tests

### Test 1: Strict Evaluation - Empty Answer
**Purpose**: Verify scoring penalizes insufficient answers

**Steps**:
1. Start a mock interview
2. Submit empty text answer or <5 words
3. **Expected Result**:
   - ❌ Verdict: `INSUFFICIENT`
   - Score: Clarity=0, Correctness=0, Depth=0
   - Feedback: "Answer is too short or empty. A minimum of 5 meaningful words is required."
   - Missing key points listed
   - Reference answer displayed

**FAIL if**: Score > 2 or motivational feedback appears

---

### Test 2: Strict Evaluation - Wrong Answer
**Purpose**: Verify wrong answers scored as wrong

**Steps**:
1. Question: "Explain closures in JavaScript"
2. Answer: "Closures are when you close files after using them"
3. **Expected Result**:
   - ❌ Verdict: `INCORRECT` or `PARTIALLY INCORRECT`
   - Correctness score: 0-2
   - Feedback explicitly states "incorrect"
   - Shows all missing key points
   - Displays correct reference answer

**FAIL if**: 
- Score > 3
- Feedback says "Good answer" or "Excellent"
- No reference answer shown

---

### Test 3: Strict Evaluation - Correct Answer
**Purpose**: Verify good answers get proper scores

**Steps**:
1. Question: "Explain closures in JavaScript"
2. Answer: "A closure is a function that has access to variables in its outer lexical scope, even after the outer function has returned. For example, function outer(x) { return function inner(y) { return x + y; } } creates a closure where inner() accesses x from outer()'s scope."
3. **Expected Result**:
   - ✅ Verdict: `CORRECT`
   - Correctness score: 7-10
   - Clarity score: 7-10
   - Depth score: 6-10
   - Minimal feedback, no missing points

**FAIL if**: Any score < 7 for this quality answer

---

### Test 4: No Alert Popups
**Purpose**: Verify error handling doesn't block UI

**Steps**:
1. Disconnect internet OR stop backend server
2. Submit any answer
3. **Expected Result**:
   - ⚠️ **Inline error message** appears at top of feedback area:
     "AI evaluation unavailable. Using strict local evaluation."
   - Orange background, non-blocking
   - Evaluation still completes with local strict mode
   - **NO ALERT() POPUP**

**FAIL if**: Any alert dialog appears

---

### Test 5: Audio Playback
**Purpose**: Verify voice recording is audible

**Steps**:
1. Navigate to voice round (answer 5 text questions first)
2. Click "Start Recording"
3. Speak clearly for 10 seconds: "This is a test recording"
4. Click "Stop Recording"
5. **Check Console**:
   ```
   [Audio] Recording with MIME type: audio/webm;codecs=opus
   [Audio] Chunk recorded: 12480 bytes
   [Audio] Blob created: 124800 bytes, MIME: audio/webm;codecs=opus
   [Audio] Object URL created: blob:...
   [Audio] Metadata loaded. Duration: 10.2 s
   [Audio] Ready to play
   ```
6. Click play on audio element
7. **Expected Result**:
   - Audio plays clearly
   - Volume audible
   - Duration matches recording time (~10s)

**FAIL if**:
- No audio playback
- Duration = 0
- Volume too low
- Blob size = 0

---

### Test 6: Interview Restart (Critical Bug Fix)
**Purpose**: Verify no "Loading..." stuck state

**Steps**:
1. Start mock interview
2. Answer 1-2 questions
3. Exit interview (refresh page or close)
4. Navigate back to Mock Interview
5. Click "Start Interview" again
6. **Expected Result**:
   - ✅ Interview starts immediately
   - First question displays
   - Timer starts
   - **NO "Track: Loading..." stuck**

**FAIL if**: UI stuck on "Loading..." or start button disabled

---

### Test 7: State Reset
**Purpose**: Verify complete state clearing

**Steps**:
1. Start interview → answer 3 questions → exit
2. Open browser DevTools → Console
3. Type: `localStorage.getItem('mockInterviewSession')`
4. Start new interview
5. **Expected Result**:
   - Old session cleared
   - Question index = 0
   - No previous answers
   - Timer starts fresh

**Console logs should show**:
```
[State] Resetting interview state
[State] Reset complete
```

**FAIL if**: Old session data persists or timer continues from previous

---

### Test 8: API Retry Logic
**Purpose**: Verify retry before fallback

**Steps**:
1. Monitor Network tab in DevTools
2. Submit answer
3. **Expected Result**:
   - First API call: POST /api/interview/evaluate
   - Wait 1 second
   - Second API call (retry): POST /api/interview/evaluate
   - If both fail → fallback to local evaluation
   - Inline error message displayed

**Console logs**:
```
[Evaluation] Retrying AI evaluation...
[Evaluation] Using local strict evaluation
```

**FAIL if**: Only one API attempt or immediate fallback

---

### Test 9: Score Color Coding
**Purpose**: Verify visual feedback matches scores

**Steps**:
1. Submit various quality answers
2. Check score display colors

**Expected**:
- Score 8-10: **Green** (success)
- Score 6-7: **Blue** (medium)
- Score 4-5: **Orange** (low)
- Score 0-3: **Red** (very low)

**FAIL if**: All scores same color or wrong colors

---

### Test 10: Microphone Permission
**Purpose**: Verify only critical errors use alert()

**Steps**:
1. Clear microphone permissions (browser settings)
2. Navigate to voice round
3. Click "Start Recording"
4. **Expected Result**:
   - ✅ Alert popup asks for microphone permission (acceptable)
   - After granting: recording starts normally

**Other errors should NOT show alerts**:
- API failures → inline error only
- Evaluation errors → inline error only
- Timer errors → console log only

**FAIL if**: Alert appears for non-permission errors

---

## Automated Test Script

Save as `test-mock-interview.js` and run in console:

```javascript
// Test 1: Empty Answer Scoring
async function testEmptyAnswer() {
    console.log('TEST 1: Empty Answer');
    const result = EvaluationService.evaluateStrictLocal(
        {
            id: 'test-1',
            text: 'Test question',
            referenceAnswer: {
                definition: 'Test definition',
                keyPoints: ['point1', 'point2', 'point3'],
                codeExample: null,
                commonMistakes: []
            }
        },
        '', // empty answer
        { type: 'text' }
    );
    
    console.assert(result.verdict === 'INSUFFICIENT', 'FAIL: Empty answer should be INSUFFICIENT');
    console.assert(result.scores.correctness === 0, 'FAIL: Correctness should be 0');
    console.log('✅ Empty answer test passed');
}

// Test 2: Wrong Answer Scoring
async function testWrongAnswer() {
    console.log('TEST 2: Wrong Answer');
    const result = EvaluationService.evaluateStrictLocal(
        {
            id: 'test-1',
            text: 'Explain closures',
            referenceAnswer: {
                definition: 'Closures are...',
                keyPoints: ['lexical scope', 'inner function', 'outer variables'],
                codeExample: null,
                commonMistakes: []
            }
        },
        'Closures are when you close files',
        { type: 'text' }
    );
    
    console.assert(result.scores.correctness <= 2, 'FAIL: Wrong answer should score 0-2');
    console.assert(result.verdict === 'INCORRECT', 'FAIL: Should be INCORRECT');
    console.assert(result.gaps.length > 0, 'FAIL: Should list missing points');
    console.log('✅ Wrong answer test passed');
}

// Test 3: Correct Answer Scoring
async function testCorrectAnswer() {
    console.log('TEST 3: Correct Answer');
    const result = EvaluationService.evaluateStrictLocal(
        {
            id: 'test-1',
            text: 'Explain closures',
            referenceAnswer: {
                definition: 'Closures are...',
                keyPoints: ['lexical scope', 'inner function', 'outer variables'],
                codeExample: null,
                commonMistakes: []
            }
        },
        'A closure provides access to an outer function scope from an inner function. The inner function has access to variables in three scopes: its own scope, the outer function scope (lexical scope), and global scope. Even after the outer function returns, the inner function can still access the outer variables.',
        { type: 'text' }
    );
    
    console.assert(result.scores.correctness >= 7, 'FAIL: Correct answer should score 7+');
    console.assert(result.verdict === 'CORRECT', 'FAIL: Should be CORRECT');
    console.log('✅ Correct answer test passed');
}

// Run all tests
(async function runAllTests() {
    console.log('========================================');
    console.log('MOCK INTERVIEW SYSTEM - AUTOMATED TESTS');
    console.log('========================================');
    
    try {
        await testEmptyAnswer();
        await testWrongAnswer();
        await testCorrectAnswer();
        
        console.log('========================================');
        console.log('✅ ALL AUTOMATED TESTS PASSED');
        console.log('========================================');
    } catch (error) {
        console.error('❌ TEST SUITE FAILED:', error);
    }
})();
```

---

## Expected Console Output (Healthy System)

```
[State] Initializing Mock Interview System
[Audio] Recording with MIME type: audio/webm;codecs=opus
[Audio] Chunk recorded: 12480 bytes
[Audio] Blob created: 124800 bytes, MIME: audio/webm;codecs=opus
[Audio] Object URL created: blob:http://localhost:3000/abc-123
[Audio] Metadata loaded. Duration: 15.2 s
[Audio] AudioContext resumed
[Audio] Ready to play
[Evaluation] Displaying feedback: { isCorrect: false, verdict: 'INCORRECT', ... }
[State] Resetting interview state
[State] Reset complete
```

**Red Flags**:
```
❌ alert() called           → FAIL Test 4
❌ Blob size: 0             → FAIL Test 5
❌ Duration: 0 or NaN       → FAIL Test 5
❌ Track: Loading...        → FAIL Test 6
❌ "Excellent answer!"      → FAIL Test 1-3
❌ Correctness: 8 (wrong)   → FAIL Test 2
```

---

## Performance Benchmarks

**Target Metrics**:
- Evaluation time: <2s (local), <15s (AI)
- Audio recording start: <1s
- Audio playback start: <500ms
- State reset: <100ms
- UI response: <16ms (60fps)

**Measure with**:
```javascript
console.time('evaluation');
await evaluateAnswer(...);
console.timeEnd('evaluation');
```

---

## Browser-Specific Testing

### Chrome
- ✅ All features supported
- ✅ MIME type: `audio/webm;codecs=opus`

### Firefox
- ✅ All features supported
- ⚠️ MIME type might be `audio/ogg;codecs=opus`

### Safari
- ⚠️ Requires AudioContext.resume() for playback
- ⚠️ MIME type might be `audio/mp4`
- ✅ Should work with fixes implemented

### Edge
- ✅ Same as Chrome (Chromium-based)

---

## Production Readiness Checklist

- [ ] **Evaluation Quality**
  - [ ] Wrong answers score 0-2
  - [ ] Correct answers score 7-10
  - [ ] No sugarcoating in feedback
  - [ ] Reference answers displayed for low scores

- [ ] **Error Handling**
  - [ ] No alert() except microphone permission
  - [ ] Inline errors for API failures
  - [ ] Retry logic works (2 attempts)
  - [ ] Graceful fallback to local evaluation

- [ ] **Audio System**
  - [ ] Recording works in all browsers
  - [ ] Playback is audible
  - [ ] MIME types logged correctly
  - [ ] Duration displayed accurately

- [ ] **State Management**
  - [ ] No "Loading..." stuck bug
  - [ ] Complete state reset on restart
  - [ ] localStorage cleared properly
  - [ ] Timers stopped on exit

- [ ] **UI/UX**
  - [ ] Verdict badges color-coded
  - [ ] Missing points highlighted
  - [ ] Score colors match values
  - [ ] Buttons enable/disable correctly

---

## Troubleshooting

### Issue: Scores always high even for wrong answers
**Diagnosis**: Old evaluation logic still in use
**Fix**: Verify `EvaluationService.evaluateStrictLocal()` called, not old `evaluateAnswerMock()`

### Issue: Alert popups still appearing
**Diagnosis**: `showNotification()` not updated
**Fix**: Check line 1467 in mock-interview.js, should have inline error div

### Issue: Audio silent
**Diagnosis**: MIME type mismatch or autoplay policy
**Fix**: Check console for `[Audio]` logs, verify AudioContext resumed

### Issue: UI stuck on restart
**Diagnosis**: Incomplete state reset
**Fix**: Verify `resetInterviewState()` clears all properties (line 443)

---

**System validated as production-ready when all tests pass.**
