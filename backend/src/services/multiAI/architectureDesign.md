# Enterprise Multi-AI Skill Gap Analyzer Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RESUME UPLOAD                                │
│                     (PDF/DOC/DOCX/Image)                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: DOCUMENT AI - Structured Ingestion & Layout Analysis     │
│  ─────────────────────────────────────────────────────────────────  │
│  Services: Google Document AI / Azure Form Recognizer              │
│  Output: Structured JSON with layout, sections, formatting         │
│  Audit Log: Document structure, confidence scores, bounding boxes  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 2: NLP EXTRACTION - Deterministic Skill Detection           │
│  ─────────────────────────────────────────────────────────────────  │
│  Service: Amazon Comprehend / Azure Text Analytics                 │
│  Output: Entities, key phrases, explicit skill mentions            │
│  Audit Log: Entity recognition confidence, text spans, evidence    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3: LLM INFERENCE - Contextual & Implicit Skill Discovery    │
│  ─────────────────────────────────────────────────────────────────  │
│  Service: OpenAI GPT-4.1 / Claude Opus 3.5                         │
│  Output: Inferred skills, proficiency levels, context analysis     │
│  Audit Log: LLM reasoning, token usage, temperature settings       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 4: MARKET INTELLIGENCE - Job Market Validation              │
│  ─────────────────────────────────────────────────────────────────  │
│  Services: LinkedIn Skills API / Lightcast (EMSI) / O*NET          │
│  Output: Market demand, salary correlation, skill requirements     │
│  Audit Log: API responses, demand scores, trending data            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 5: CONFIDENCE ENGINE - Rules-Based Scoring & Classification │
│  ─────────────────────────────────────────────────────────────────  │
│  Custom Logic: Evidence aggregation, confidence calculation        │
│  Output: Strong/Needs Improvement/Not Demonstrated classifications │
│  Audit Log: Score calculations, evidence weights, decision rules   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 6: ARBITRATION - Independent Synthesis & Validation         │
│  ─────────────────────────────────────────────────────────────────  │
│  Service: Separate LLM instance (Claude/GPT-4 as arbiter)          │
│  Output: Final assessment, conflict resolution, transparency notes │
│  Audit Log: Arbitration decisions, conflicts resolved, reasoning   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPREHENSIVE AUDIT TRAIL                         │
│  ─────────────────────────────────────────────────────────────────  │
│  • Layer-by-layer decision logs                                     │
│  • Evidence chains with confidence scores                           │
│  • API call logs with timestamps                                    │
│  • Conflict resolutions and arbitration reasoning                   │
│  • Exportable audit reports (JSON/PDF)                              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ENHANCED UI DISPLAY                             │
│  ─────────────────────────────────────────────────────────────────  │
│  • Skill cards with confidence percentages                          │
│  • Evidence viewer with source highlighting                         │
│  • Layer-by-layer decision breakdown                                │
│  • Market insights and salary data                                  │
│  • Downloadable audit report                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎯 Layer Details

### Layer 1: Document AI (Structured Ingestion)
**Primary**: Google Document AI  
**Fallback**: Azure Form Recognizer  
**Purpose**: Extract structured data with layout awareness

**Capabilities**:
- OCR for scanned documents
- Table extraction
- Section identification (Education, Experience, Skills)
- Formatting preservation
- Confidence scores per field

**Output Schema**:
```json
{
  "documentId": "uuid",
  "confidence": 0.95,
  "sections": {
    "personalInfo": { "name": "...", "email": "...", "confidence": 0.98 },
    "summary": { "text": "...", "confidence": 0.92 },
    "skills": { "items": [...], "confidence": 0.96 },
    "experience": { "entries": [...], "confidence": 0.94 },
    "education": { "entries": [...], "confidence": 0.97 }
  },
  "rawText": "...",
  "layout": { "bounding_boxes": [...] },
  "processingTime": 1234,
  "auditTrail": { "timestamp": "...", "service": "Google Document AI" }
}
```

### Layer 2: NLP Extraction (Deterministic Skill Detection)
**Primary**: Amazon Comprehend  
**Fallback**: Azure Text Analytics  
**Purpose**: Extract entities and key phrases with high precision

**Capabilities**:
- Named Entity Recognition (NER)
- Key phrase extraction
- Syntax analysis
- Custom entity recognition
- Sentiment analysis for context

**Output Schema**:
```json
{
  "layerId": "nlp-extraction",
  "entities": [
    {
      "text": "React",
      "type": "SKILL",
      "score": 0.94,
      "beginOffset": 123,
      "endOffset": 128,
      "context": "Built scalable applications using React..."
    }
  ],
  "keyPhrases": ["React", "Node.js", "RESTful APIs"],
  "skillMentions": [
    {
      "skill": "React",
      "count": 3,
      "locations": ["skills", "experience", "projects"],
      "confidence": 0.94
    }
  ],
  "auditTrail": {
    "service": "Amazon Comprehend",
    "timestamp": "...",
    "apiCalls": 2,
    "costEstimate": "$0.002"
  }
}
```

### Layer 3: LLM Inference (Contextual & Implicit Skills)
**Primary**: OpenAI GPT-4.1  
**Fallback**: Claude Opus 3.5  
**Purpose**: Infer implicit skills and assess proficiency

**Capabilities**:
- Context-aware skill inference
- Proficiency level assessment
- Project complexity analysis
- Technology stack understanding
- Years of experience estimation

**Prompt Engineering**:
```
You are an expert technical recruiter analyzing a resume.

Resume Section: {text}
Detected Explicit Skills: {explicitSkills}

Task:
1. Identify IMPLIED skills not explicitly mentioned
2. Assess proficiency level (Beginner/Intermediate/Advanced/Expert)
3. Provide reasoning for each inference
4. Estimate years of experience per skill

Return JSON with:
- inferredSkills: array of skills with reasoning
- proficiencyAssessment: skill → level mapping
- confidenceScores: 0-100 for each inference
- reasoning: detailed explanation

Be conservative. Only infer skills with strong evidence.
```

**Output Schema**:
```json
{
  "layerId": "llm-inference",
  "model": "gpt-4.1-turbo",
  "temperature": 0.3,
  "inferredSkills": [
    {
      "skill": "State Management",
      "reasoning": "Candidate mentions React extensively and Redux in projects",
      "confidence": 0.78,
      "evidence": ["React experience", "Complex UI components"],
      "proficiency": "Intermediate"
    }
  ],
  "proficiencyLevels": {
    "React": { "level": "Advanced", "confidence": 0.92, "yearsEstimate": 3 }
  },
  "auditTrail": {
    "promptTokens": 1234,
    "completionTokens": 567,
    "totalCost": "$0.03",
    "latency": 2.3,
    "timestamp": "..."
  }
}
```

### Layer 4: Market Intelligence (Job Market Validation)
**Primary**: LinkedIn Skills API  
**Fallback**: Lightcast (EMSI) / O*NET  
**Purpose**: Validate skills against real job market data

**Capabilities**:
- Skill demand trends
- Salary correlation
- Job posting frequency
- Geographic demand
- Skill co-occurrence patterns
- Career path recommendations

**APIs**:
- LinkedIn Skills Graph API
- Lightcast Labor Market API
- O*NET Web Services
- Indeed Job Trends API (supplementary)

**Output Schema**:
```json
{
  "layerId": "market-intelligence",
  "skills": [
    {
      "skill": "React",
      "marketDemand": {
        "score": 96,
        "jobPostings": 45000,
        "trend": "growing",
        "growthRate": 12.5
      },
      "salaryImpact": {
        "averageSalary": 115000,
        "percentileBoost": 15,
        "currency": "USD"
      },
      "coOccurrence": ["Node.js", "TypeScript", "Redux"],
      "industryRelevance": {
        "tech": 98,
        "finance": 65,
        "healthcare": 45
      }
    }
  ],
  "roleAlignment": {
    "targetRole": "Full-Stack Developer",
    "matchScore": 78,
    "criticalGaps": ["Kubernetes", "CI/CD"]
  },
  "auditTrail": {
    "dataSource": "LinkedIn Skills API + Lightcast",
    "dataFreshness": "2026-01-30",
    "apiCalls": 5,
    "rateLimit": "remaining: 995/1000"
  }
}
```

### Layer 5: Confidence Engine (Rules-Based Scoring)
**Purpose**: Aggregate evidence and calculate final confidence scores

**Scoring Algorithm**:
```python
def calculate_confidence(skill_data):
    # Evidence sources with weights
    weights = {
        'document_ai': 0.15,      # Layout-based detection
        'nlp_explicit': 0.30,     # Direct mentions
        'llm_inference': 0.25,    # Context analysis
        'market_validation': 0.15, # Market relevance
        'frequency': 0.10,        # Mention count
        'context_quality': 0.05   # Context richness
    }
    
    scores = {
        'document_ai': get_section_confidence(skill),
        'nlp_explicit': get_entity_score(skill),
        'llm_inference': get_inference_confidence(skill),
        'market_validation': get_market_score(skill),
        'frequency': get_mention_score(skill),
        'context_quality': get_context_score(skill)
    }
    
    confidence = sum(weights[k] * scores[k] for k in weights)
    
    # Classification rules
    if confidence >= 0.75:
        return "Strong", confidence
    elif confidence >= 0.45:
        return "Needs Improvement", confidence
    else:
        return "Not Demonstrated", confidence
```

**Classification Rules**:
- **Strong** (≥75%): High evidence from multiple sources
- **Needs Improvement** (45-74%): Some evidence but weak
- **Not Demonstrated** (<45%): Minimal or no evidence

**Critical Rule**: If skill is explicitly mentioned (NLP confidence >0.7), minimum classification is "Needs Improvement"

**Output Schema**:
```json
{
  "layerId": "confidence-engine",
  "skills": [
    {
      "skill": "React",
      "finalConfidence": 0.89,
      "classification": "Strong",
      "evidenceBreakdown": {
        "documentAI": 0.92,
        "nlpExplicit": 0.94,
        "llmInference": 0.88,
        "marketValidation": 0.96,
        "frequency": 0.85,
        "contextQuality": 0.78
      },
      "mentions": 5,
      "sources": ["skills_section", "experience", "projects"],
      "proficiencyLevel": "Advanced",
      "yearsExperience": 3
    }
  ],
  "auditTrail": {
    "rulesApplied": ["explicit_mention_rule", "multi_source_boost"],
    "conflicts": [],
    "overrides": []
  }
}
```

### Layer 6: Arbitration (Independent Synthesis)
**Service**: Separate LLM instance (Claude or GPT-4 as arbiter)  
**Purpose**: Final validation and conflict resolution

**Arbitration Prompt**:
```
You are an independent arbiter reviewing a multi-AI skill analysis.

Input Data:
- Document AI results: {layer1}
- NLP extraction: {layer2}
- LLM inference: {layer3}
- Market intelligence: {layer4}
- Confidence scores: {layer5}

Your task:
1. Validate consistency across layers
2. Resolve any conflicts or discrepancies
3. Ensure no false negatives (mentioned skills marked as missing)
4. Provide final transparent reasoning
5. Flag any low-confidence or disputed classifications

Return:
- validatedSkills: final skill list with justifications
- conflicts: any inconsistencies found and how resolved
- warnings: skills needing manual review
- transparency: clear explanation of final decisions
```

**Output Schema**:
```json
{
  "layerId": "arbitration",
  "arbitrator": "claude-opus-3.5",
  "finalAssessment": {
    "skills": [
      {
        "skill": "React",
        "finalClassification": "Strong",
        "confidence": 0.89,
        "arbitrationNotes": "Consistent across all layers. High evidence.",
        "consensusLevel": "unanimous",
        "manualReviewNeeded": false
      }
    ],
    "conflictsResolved": [
      {
        "skill": "TypeScript",
        "conflict": "Layer 2 detected, Layer 3 low confidence",
        "resolution": "Classified as Needs Improvement due to single brief mention",
        "reasoning": "Explicit mention prevents 'Not Demonstrated' but limited evidence"
      }
    ],
    "warnings": [],
    "overallQuality": 0.94
  },
  "auditTrail": {
    "timestamp": "...",
    "reviewTime": 3.2,
    "arbitrationCost": "$0.02"
  }
}
```

## 🔒 Audit Trail System

### Audit Log Structure
```json
{
  "analysisId": "uuid",
  "timestamp": "2026-01-30T10:30:00Z",
  "resumeHash": "sha256...",
  "layers": [
    {
      "layer": 1,
      "name": "Document AI",
      "service": "Google Document AI",
      "startTime": "...",
      "endTime": "...",
      "duration": 1234,
      "input": { "file": "resume.pdf", "size": 245678 },
      "output": { "sections": 5, "confidence": 0.95 },
      "cost": "$0.015",
      "logs": [...]
    }
  ],
  "decisionChain": [
    {
      "skill": "React",
      "layer1": { "detected": true, "confidence": 0.92 },
      "layer2": { "detected": true, "confidence": 0.94, "mentions": 3 },
      "layer3": { "proficiency": "Advanced", "confidence": 0.88 },
      "layer4": { "marketDemand": 96, "salaryImpact": 15 },
      "layer5": { "finalScore": 0.89, "classification": "Strong" },
      "layer6": { "validated": true, "notes": "Consistent evidence" }
    }
  ],
  "totalCost": "$0.087",
  "totalTime": 8.7,
  "qualityScore": 0.94
}
```

## 📊 Enhanced UI Components

### 1. Skill Card with Evidence Viewer
```html
<div class="elite-skill-card strong">
  <div class="skill-header">
    <h4>React</h4>
    <span class="confidence-badge">89%</span>
    <span class="classification-badge strong">Strong</span>
  </div>
  
  <div class="evidence-breakdown">
    <div class="evidence-layer">
      <span>Document AI</span>
      <div class="confidence-bar" style="width: 92%"></div>
      <span>92%</span>
    </div>
    <div class="evidence-layer">
      <span>NLP Detection</span>
      <div class="confidence-bar" style="width: 94%"></div>
      <span>94%</span>
    </div>
    <div class="evidence-layer">
      <span>LLM Inference</span>
      <div class="confidence-bar" style="width: 88%"></div>
      <span>88%</span>
    </div>
    <div class="evidence-layer">
      <span>Market Demand</span>
      <div class="confidence-bar" style="width: 96%"></div>
      <span>96%</span>
    </div>
  </div>
  
  <div class="skill-insights">
    <p><strong>Proficiency:</strong> Advanced (3 years estimated)</p>
    <p><strong>Market Demand:</strong> Very High (45K+ job postings)</p>
    <p><strong>Salary Impact:</strong> +15% average</p>
  </div>
  
  <button class="view-audit-trail">View Decision Trail</button>
</div>
```

### 2. Audit Trail Viewer
```html
<div class="audit-trail-modal">
  <h3>Decision Trail: React</h3>
  
  <div class="layer-timeline">
    <div class="layer-step">
      <span class="layer-number">1</span>
      <div class="layer-details">
        <h4>Document AI</h4>
        <p>Detected in Skills section</p>
        <span class="confidence">92%</span>
      </div>
    </div>
    <!-- Repeat for all 6 layers -->
  </div>
  
  <div class="evidence-sources">
    <h4>Evidence Locations</h4>
    <ul>
      <li>Skills section: "Expert in React and Redux"</li>
      <li>Experience: "Built React applications for 3 years"</li>
      <li>Projects: "E-commerce platform using React + Node.js"</li>
    </ul>
  </div>
  
  <div class="arbitration-notes">
    <h4>Arbitration Assessment</h4>
    <p>All layers in agreement. High-quality evidence. Classification validated.</p>
  </div>
</div>
```

## 🔐 Security & Compliance

### Data Privacy
- Resume data encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.3)
- PII redaction before API calls
- GDPR/CCPA compliant processing
- Data retention policies enforced

### API Security
- API keys stored in Azure Key Vault / AWS Secrets Manager
- Rate limiting and circuit breakers
- Request authentication and authorization
- Audit logging for all API calls
- Cost monitoring and budget alerts

## 💰 Cost Estimation

### Per Analysis (Average Resume)
- Google Document AI: $0.015
- Amazon Comprehend: $0.002
- OpenAI GPT-4.1: $0.030
- LinkedIn Skills API: $0.020
- Claude Arbiter: $0.020
- **Total: ~$0.087 per analysis**

### Monthly (100 analyses/month)
- **~$8.70/month**
- Well within enterprise budget
- Scales linearly

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Set up API integrations
- Build audit logging system
- Create database schema

### Phase 2: Layer Implementation (Weeks 2-3)
- Layer 1: Document AI
- Layer 2: NLP Extraction
- Layer 3: LLM Inference

### Phase 3: Market & Validation (Week 4)
- Layer 4: Market Intelligence
- Layer 5: Confidence Engine
- Layer 6: Arbitration

### Phase 4: UI & Testing (Week 5)
- Enhanced UI components
- Audit trail viewer
- End-to-end testing

### Phase 5: Production (Week 6)
- Load testing
- Security audit
- Go-live

---

**Status**: Architecture Design Complete  
**Next Step**: Implementation  
**Estimated Timeline**: 6 weeks  
**Confidence Level**: Enterprise-Grade
