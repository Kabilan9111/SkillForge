# 🚀 Quick Reference: Transparent Reasoning Engine

## API Endpoint
```
POST /api/skill-gap/analyze
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Body:
  - resume: <PDF/DOC file>
  - trackId: <string>
  - trackName: "Full-Stack Developer" | "Data Scientist" | "DevOps Engineer"
  - level: "Beginner" | "Intermediate" | "Advanced"
```

## Response Structure

```javascript
{
  "success": true,
  "analysis": {
    "skills": {
      // CORE SKILLS (Production-ready)
      "strong": [{
        "skill": "React",
        "confidenceLevel": "Demonstrated",  // or "Advanced"
        "category": "core",
        "proficiencyScore": 66,
        "reasoning": "**Solid Production Experience**: React is well-demonstrated...",
        "coachingTip": "✓ Solid experience. Consider quantifying impact...",
        "evidenceSummary": { total: 4, byType: {}, sections: [], topEvidence: [] }
      }],
      
      // DEVELOPING SKILLS (Room for growth)
      "developing": [{
        "skill": "Docker",
        "confidenceLevel": "Implied",  // or "Explicit"
        "category": "developing",
        "proficiencyScore": 58,
        "reasoning": "**Working Knowledge**: Docker appears 2 times...",
        "coachingTip": "△ Docker shows potential. Strengthen by..."
      }],
      
      // MISSING SKILLS (Not detected)
      "missing": [{
        "skill": "MongoDB",
        "confidenceLevel": "Not Detected",
        "reasoning": "**Not Detected**: MongoDB was not found...",
        "coachingTip": "✗ MongoDB not detected. If you have experience..."
      }]
    }
  }
}
```

## Confidence Levels

| Level | Score Range | Depth Required | Evidence Count | Category |
|-------|-------------|----------------|----------------|----------|
| **Advanced** | 80-100 | Expert | 3+ | Core |
| **Demonstrated** | 65-79 | Advanced | 2+ | Core |
| **Implied** | 50-64 | Intermediate | 1+ | Developing |
| **Explicit** | 40-49 | Basic | 1+ | Developing |
| **Not Detected** | 0 | N/A | 0 | Missing |

## Depth Indicators

### Expert Level (weight: 100)
```javascript
['architect', 'lead', 'design system', 'mentor team', 'enterprise scale',
 'establish standards', 'technical leadership', 'director']
```

### Advanced Level (weight: 75)
```javascript
['optimize', 'scale', 'production', 'deployed', 'performance tuning',
 'implement', 'refactor', 'ci/cd', 'automation']
```

### Intermediate Level (weight: 50)
```javascript
['develop', 'build', 'create', 'integrate', 'configure',
 'maintain', 'collaborate', 'work with']
```

### Basic Level (weight: 25)
```javascript
['assist', 'learn', 'expose to', 'familiar with', 'basic knowledge',
 'coursework', 'school project', 'tutorial']
```

## Score Breakdown Weights

```javascript
{
  frequency: 15%,  // How often skill appears
  depth: 30%,      // ⭐ Most important - expertise level
  context: 25%,    // Technical richness
  placement: 15%,  // Section weighting
  impact: 10%,     // Quantifiable achievements
  recency: 5%      // Recent role mentions
}
```

## Section Weights

| Section | Weight | Rationale |
|---------|--------|-----------|
| Experience | 1.5 | Real work evidence |
| Certifications | 1.4 | Validated knowledge |
| Projects | 1.3 | Practical application |
| Summary | 1.2 | Self-assessment |
| Skills | 1.0 | Listing only |
| Education | 0.8 | Academic context |

## Usage Examples

### Example 1: Check Skill Level
```javascript
const response = await fetch('/api/skill-gap/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData  // resume file + metadata
});

const { skills } = response.analysis;

// Check if React is core skill
const react = skills.strong.find(s => s.skill === 'React');
if (react) {
  console.log(react.confidenceLevel);  // "Demonstrated"
  console.log(react.reasoning);        // Full explanation
  console.log(react.coachingTip);      // Actionable feedback
}
```

### Example 2: Display Skill Card
```jsx
<SkillCard>
  <SkillBadge level={skill.confidenceLevel} />
  <SkillName>{skill.skill}</SkillName>
  <Score>{skill.proficiencyScore}/100</Score>
  
  <Expandable>
    <Reasoning>{skill.reasoning}</Reasoning>
    <EvidenceSummary>
      Found {skill.evidenceSummary.total} pieces of evidence in:
      {skill.evidenceSummary.sections.join(', ')}
    </EvidenceSummary>
  </Expandable>
  
  <CoachingTip>{skill.coachingTip}</CoachingTip>
</SkillCard>
```

## Testing

### Unit Tests
```bash
node test-transparent-reasoning.js
```

### End-to-End Test
```bash
node verify-transparent-reasoning.js
```

### API Test
```bash
# Windows PowerShell
.\test-enhanced-flows.ps1
```

## Common Patterns

### Pattern 1: Junior Developer Assessment
```
Resume: "Deployed app with Docker"
Result: Implied (58/100)
Reasoning: "Working knowledge, lacks production-depth indicators"
✓ Fair assessment - not penalized for being junior
```

### Pattern 2: Mid-Level Production Experience
```
Resume: "Led microservices architecture using Kubernetes"
Result: Demonstrated (72/100)
Reasoning: "Practical application through 'led development' and 'implemented'"
✓ Correctly recognized production-level experience
```

### Pattern 3: Academic Only
```
Resume: "Coursework: Python, school project with Flask"
Result: Explicit (47/100)
Reasoning: "Foundational knowledge, primarily from academic context"
✓ Appropriately flagged as entry-level
```

## Troubleshooting

### Issue: Skill Not Detected
**Symptoms**: RESTful APIs mentioned but not detected  
**Cause**: Missing inference rule  
**Fix**: Add to inference rules in `skillDetectionService.js`

### Issue: Score Too Low
**Symptoms**: "Mentored team on React" = 61/100 (should be higher)  
**Cause**: Depth score needs tuning  
**Fix**: Increase weight for mentoring keywords in `skillProficiencyAnalyzer.js`

### Issue: Reasoning Too Generic
**Symptoms**: All skills get same reasoning template  
**Cause**: Insufficient depth indicators matched  
**Fix**: Expand depth indicator keywords for specific tech stacks

## Performance Tips

1. **Cache resume structure** - Don't re-parse for multiple analyses
2. **Batch skill analysis** - Analyze all skills in one pass
3. **Use semantic patterns** - Better than keyword matching
4. **Limit evidence** - Top 3 pieces sufficient for scoring

## Security Considerations

1. **File upload validation** - Only PDF/DOC, max 10MB
2. **Text extraction safety** - Sanitize extracted text
3. **Rate limiting** - Prevent abuse of expensive parsing
4. **User data privacy** - Store resume hash, not full content

---

**Version**: 2.0  
**Last Updated**: 2024  
**Status**: Production-Ready ✅
