# 🚀 Quick Start Guide - Coding Arena

## Instant Testing (2 minutes)

### Option 1: Standalone Demo
1. Open `coding-arena-demo.html` in your browser
2. Click **"Launch Coding Arena"** button
3. Explore the Two Sum problem with full AI mentor support

### Option 2: Full Integration
1. Open `index.html` in your browser
2. Navigate to **DSA Practice Arena** from the sidebar
3. Click any problem card
4. Coding arena opens automatically

## Quick Verification Checklist

### Visual Check (30 seconds)
- [ ] Three panels visible (Problem | Editor | Tabs)
- [ ] Dark theme applied consistently
- [ ] AI Mentor tab shows welcome message
- [ ] Run Code and Submit buttons visible

### Functional Check (2 minutes)
- [ ] Type code in editor (should accept input)
- [ ] Press Tab key (should indent)
- [ ] Click "Run Code" (should show output after 1 sec)
- [ ] Switch to "AI Assistant" tab
- [ ] Click "Get a Hint" (should show hint message)
- [ ] Click "Back to Problems" (should return)

### Integration Check (1 minute)
- [ ] Open main `index.html`
- [ ] Click DSA Practice in sidebar
- [ ] Click any problem card
- [ ] Arena opens in full-screen
- [ ] Back button works

## Troubleshooting

### Arena doesn't open
**Problem**: Clicking problem does nothing  
**Solution**: Check browser console for errors. Ensure `coding-arena.js` loaded.

### Code editor not working
**Problem**: Can't type in editor  
**Solution**: Click inside the editor area. It uses `contenteditable`.

### AI responses not showing
**Problem**: Clicking hint button does nothing  
**Solution**: Check if `currentProblem` is set. Try opening Two Sum from demo.

### Styling broken
**Problem**: Layout looks wrong or colors off  
**Solution**: Ensure `coding-arena-styles.css` is loaded. Check browser DevTools.

## Testing Scenarios

### Scenario 1: First-Time User
1. Land on DSA Practice page
2. See topics grid with problems
3. Click "Arrays" → "Two Sum"
4. Arena opens → Problem loads
5. Read description
6. Click "Get a Hint"
7. Write some code
8. Click "Run Code"
9. See test results
10. Click "Back to Problems"

### Scenario 2: Returning User
1. Open Two Sum (should load from `coding-arena-demo.html`)
2. Code editor should be empty (or show draft if previously saved)
3. Write solution
4. Switch language (Python → JavaScript)
5. Confirm reset prompt
6. Submit solution
7. See "Accepted" status

### Scenario 3: AI Interaction
1. Open any problem
2. Switch to "AI Assistant" tab
3. Click "Hint Mode" (default active)
4. Click "Get a Hint" → Hint 1 appears
5. Click again → Hint 2 appears
6. Click again → Hint 3 appears
7. Click again → "You've seen all hints" message
8. Switch to "Debug Mode"
9. Type "I'm getting an error" in input
10. Press Enter → Debug response appears

### Scenario 4: Code Execution
1. Open Two Sum
2. Copy-paste working Python solution:
   ```python
   def twoSum(nums, target):
       seen = {}
       for i, num in enumerate(nums):
           complement = target - num
           if complement in seen:
               return [seen[complement], i]
           seen[num] = i
   ```
3. Click "Run Code"
4. Wait 1 second
5. See "Test Results: X/Y passed"
6. Click "Submit"
7. See "Accepted!" message (or wrong answer)

## Browser DevTools Checks

### Console Logs to Expect
```
[CodingArena] Initialized successfully
[CodingArena] Opening problem: two-sum
[CodingArena] Opened problem: 1. Two Sum
```

### LocalStorage Keys
After using the arena, check `localStorage`:
- `codingDrafts` - Should have `two-sum` entry with code
- `codingProgress` - Should have attempt count, time
- `solvedProblems` - Should include `two-sum` if submitted

### Network Tab
- No network requests (everything client-side)
- All CSS/JS files loaded (200 status)

## Performance Check

### Load Time
- Arena should open instantly (<100ms)
- Code execution simulation: ~1 second
- AI responses: ~500ms delay (simulated thinking)

### Memory Usage
- Check DevTools → Performance Monitor
- Memory should be <50MB for arena
- No memory leaks (test by opening/closing multiple times)

## Accessibility Check

### Keyboard Navigation
- Tab through all buttons (should see focus outline)
- Enter in AI input field (should send message)
- Tab in code editor (should indent, not navigate away)

### Screen Reader
- Open browser screen reader
- Navigate through panels
- All buttons should have labels
- Problem description should read clearly

## Final Verification

### ✅ All Systems Go
If you can complete this sequence without errors, the arena is production-ready:

1. Open `coding-arena-demo.html`
2. Click "Launch Coding Arena"
3. See problem description, examples, constraints
4. Type `print("Hello")` in editor
5. Click "Run Code"
6. See output console update
7. Switch to "AI Assistant" tab
8. Click "Get a Hint"
9. See hint message appear
10. Click "Back to Demo"
11. Arena closes, demo page appears

**If all 11 steps work → 🎉 Arena is fully functional!**

## Quick Fixes

### Fix 1: Re-link CSS
If styling is broken, add to `<head>` of HTML:
```html
<link rel="stylesheet" href="coding-arena-styles.css">
```

### Fix 2: Re-link JS
If functionality is broken, add before `</body>`:
```html
<script src="coding-arena.js"></script>
```

### Fix 3: Clear LocalStorage
If draft/progress data is corrupted:
```javascript
localStorage.removeItem('codingDrafts');
localStorage.removeItem('codingProgress');
localStorage.removeItem('solvedProblems');
```

### Fix 4: Reload CSS Variables
If colors are wrong, check `styles.css` has:
```css
:root {
    --bg-primary: #0a0a0a;
    --bg-card: #1a1a1a;
    --accent-primary: #e53935;
    --text-primary: #ffffff;
    --text-muted: #999999;
}
```

## Next Steps

### After Verification
1. ✅ Test demo page (standalone)
2. ✅ Test integration with main app
3. ✅ Verify all AI modes work
4. ✅ Check code execution flow
5. ✅ Test on different browsers
6. ⏭️ Add more problems (see `CODING_ARENA_README.md`)
7. ⏭️ Integrate real code execution
8. ⏭️ Add syntax highlighting

### Production Deployment
1. Ensure all files in `roadmap-dashboard/` folder
2. Test on production server
3. Monitor console for errors
4. Check user feedback
5. Iterate based on usage data

---

**Ready to code?** Open `coding-arena-demo.html` and start solving! 🚀
