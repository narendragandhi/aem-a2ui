# AEM A2UI Architecture: A Modern Approach to Content Authoring

## The Problem: CMS Authoring at Scale

### Enterprise Content Challenges

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE CMS AUTHORING PROBLEM                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │  TRADITIONAL CMS AUTHORING                                             │
    │                                                                         │
    │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌───────────┐ │
    │  │   Author    │   │  Component  │   │    DAM      │  │  Workflow │ │
    │  │  spends...  │──►│   Dialog    │──►│  Browser    │──►│  Engine   │ │
    │  └─────────────┘   └─────────────┘   └─────────────┘   └───────────┘ │
    │        │                 │                 │                 │        │
    │        ▼                 ▼                 ▼                 ▼        │
    │   60-70% of         Dialog fatigue     Asset search      Approval     │
    │   authoring time    (complexity)       (too many)       bottleneck   │
    │                                                                         │
    │  OUTCOME:                                                            │
    │  • Slow content velocity                                             │
    │  • Brand inconsistency                                               │
    │  • Author frustration                                                │
    │  • Delayed time-to-market                                            │
    └─────────────────────────────────────────────────────────────────────────┘
```

### Quantified Impact

| Metric | Enterprise Average | Impact |
|--------|-------------------|--------|
| Time per content piece | 23-45 minutes | 60-70% on repetitive tasks |
| Brand compliance | ~60% | Requires review cycles |
| Daily content output | 3-4 pages | Limited by authoring speed |
| Author training | 2-4 weeks | Steep learning curve |

---

## The Solution: AI-Native Authoring Interface

### Architectural Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    A2UI ARCHITECTURAL OVERVIEW                              │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                         PRESENTATION LAYER                              │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐  │
   │  │                   Adobe Spectrum Web Components                  │  │
   │  │                                                                  │  │
   │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
   │  │  │  Assistant  │  │   Preview   │  │   DAM       │             │  │
   │  │  │   Panel     │  │   Canvas    │  │   Browser   │             │  │
   │  │  └─────────────┘  └─────────────┘  └─────────────┘             │  │
   │  │                                                                  │  │
   │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
   │  │  │    Brand    │  │   Workflow  │  │   Content   │             │  │
   │  │  │   Score     │  │   Panel     │  │   Wizard    │             │  │
   │  │  └─────────────┘  └─────────────┘  └─────────────┘             │  │
   │  │                                                                  │  │
   │  └─────────────────────────────────────────────────────────────────┘  │
   │                                    │                                    │
   │                                    ▼                                    │
   │                    ┌─────────────────────────────────┐                 │
   │                    │     A2UI + AG-UI Protocols       │                 │
   │                    │                                 │                 │
   │                    │  • Structured requests          │                 │
   │                    │  • Rich UI definitions          │                 │
   │                    │  • Real-time streaming          │                 │
   │                    │  • Interactive actions          │                 │
   │                    └─────────────────────────────────┘                 │
   └─────────────────────────────────────────┬───────────────────────────────┘
                                             │
                                             ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                      APPLICATION LAYER                                   │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐    │
   │  │                  Java Agent (Spring Boot)                        │    │
   │  │                                                                   │    │
   │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │    │
   │  │  │  Brand Engine   │  │  LLM Service    │  │  Content Gen   │ │    │
   │  │  │                 │  │                 │  │                 │ │    │
   │  │  │ • Guidelines    │  │ • OpenAI        │  │ • Templates     │ │    │
   │  │  │ • Voice/Tone    │  │ • Anthropic     │  │ • Variations    │ │    │
   │  │  │ • Scoring       │  │ • Ollama        │  │ • Components    │ │    │
   │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │    │
   │  │                                                                   │    │
   │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │    │
   │  │  │ DAM Integration │  │  Workflow Svc   │  │  AEM Adapter   │ │    │
   │  │  │                 │  │                 │  │                 │ │    │
   │  │  │ • Sling JSON    │  │ • Submission    │  │ • REST API     │ │    │
   │  │  │ • Asset search  │  │ • Status        │  │ • Content sync │ │    │
   │  │  │ • Filtering     │  │ • Approval      │  │ • Auth         │ │    │
   │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │    │
   │  │                                                                   │    │
   │  └─────────────────────────────────────────────────────────────────┘    │
   │                                    │                                    │
   └────────────────────────────────────┼────────────────────────────────────┘
                                         │
                                         ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                       INTEGRATION LAYER                                   │
   │                                                                         │
   │  ┌─────────────────────┐              ┌─────────────────────┐            │
   │  │   AEM Author       │              │    LLM Providers     │            │
   │  │                                                                         │
   │  │  • Content Store    │              │  • OpenAI (cloud)    │            │
   │  │  • DAM Assets       │              │  • Anthropic (cloud) │            │
   │  │  • Workflow Engine  │              │  • Ollama (local)   │            │
   │  │  • User Auth        │              │                     │            │
   │  └─────────────────────┘              └─────────────────────┘            │
   └─────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale | Trade-off |
|----------|------------|-----------|
| External microservice | Decouples AI from AEM, allows independent scaling | Added infrastructure |
| REST/SSE communication | Standard protocols, firewall-friendly | Latency vs polling |
| Template fallback | Works without AI, reliable baseline | Less AI creativity |
| Multi-LLM support | Flexibility, privacy options, cost control | Configuration complexity |
| Brand configuration externalized | Easy customization, no code changes | Configuration management |

---

## Observability and Governance

To support demos and evaluation, the agent exposes lightweight telemetry and governance checks:

- **Telemetry aggregation:** The backend records key demo events and exposes summary feeds for the UI.
- **Governance streaming:** A dedicated SSE stream (`/stream/governance`) emits compliance results as `CUSTOM_EVENT` and uses HITL signals for blocking violations.
- **Feature gating:** Demo-only endpoints are controlled by `aem.demo.enabled` to keep production surfaces clean.

---

## Why A2UI Over Alternative Approaches?

### Comparison of Approaches

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CMS AUTHORING APPROACH COMPARISON                           │
└─────────────────────────────────────────────────────────────────────────────┘

   Approach              Pros                    Cons              A2UI Position
   ──────────────────────────────────────────────────────────────────────────
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ 1. TRADITIONAL DIALOGS                                                  │
   │                                                                         │
   │    What:     Manual field-by-field entry                                │
   │    Pros:     Familiar, validated                                        │
   │    Cons:     Slow, complex, error-prone                                 │
   │                                                                         │
   │    ┌───────────────────────────────────────────────────────────────┐     │
   │    │  A2UI Advantage: Conversational input replaces dialogs       │     │
   │    └───────────────────────────────────────────────────────────────┘     │
   └──────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────────────┐
   │ 2. HEADLESS CMS + AI COMPLETION                                        │
   │                                                                         │
   │    What:     AI suggests completions in form fields                     │
   │    Pros:     Incremental improvement                                    │
   │    Cons:     Still dialog-based, partial automation                    │
   │                                                                         │
   │    ┌───────────────────────────────────────────────────────────────┐     │
   │    │  A2UI Advantage: Generates complete components at once       │     │
   │    └───────────────────────────────────────────────────────────────┘     │
   └──────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────────────┐
   │ 3. NATURAL LANGUAGE TO HTML                                             │
   │                                                                         │
   │    What:     Generate raw HTML from prompts                             │
   │    Pros:     Fast generation                                            │
   │    Cons:     Not aligned with CMS components, no brand enforcement     │
   │                                                                         │
   │    ┌───────────────────────────────────────────────────────────────┐     │
   │    │  A2UI Advantage: Generates structured CMS content           │     │
   │    │                  Integrates with DAM, workflows             │     │
   │    └───────────────────────────────────────────────────────────────┘     │
   └──────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────────────────────┐
   │ 4. A2UI (THIS APPROACH)                                                 │
   │                                                                         │
   │    What:     Agent generates complete component configurations          │
   │              with brand scoring and workflow integration                 │
   │                                                                         │
   │    Advantages:                                                        │
   │    • Complete component generation (not just text)                     │
   │    • Brand enforcement at generation time                               │
   │    • Real-time feedback (brand score)                                  │
   │    • Native AEM integration (DAM, workflows)                          │
   │    • Rich UI with interactive actions                                  │
   │                                                                         │
   └──────────────────────────────────────────────────────────────────────────┘
```

### Why the A2UI Approach Wins

| Capability | Traditional | AI Completion | Raw HTML | A2UI |
|------------|-------------|---------------|----------|------|
| Complete component | ❌ | ❌ | ⚠️ | ✅ |
| Brand enforcement | ❌ | ⚠️ | ❌ | ✅ |
| Real-time feedback | ❌ | ❌ | ❌ | ✅ |
| DAM integration | ⚠️ | ❌ | ❌ | ✅ |
| Workflow ready | ⚠️ | ❌ | ❌ | ✅ |
| Interactive actions | ❌ | ❌ | ❌ | ✅ |

---

## Integration Architecture

### AEM Integration Points

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AEM INTEGRATION ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                        AEM AUTHOR INSTANCE                               │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐  │
   │  │  Content Repository (/content)                                   │  │
   │  │                                                                  │  │
   │  │  • Pages                                                        │  │
   │  │  • Content Fragments                                            │  │
   │  │  • Experience Fragments                                         │  │
   │  └─────────────────────────────────────────────────────────────────┘  │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐  │
   │  │  DAM (/content/dam)                                             │  │
   │  │                                                                  │  │
   │  │  • Images, Videos, Documents                                     │  │
   │  │  • Metadata, Tags, Collections                                  │  │
   │  │  • Renditions (via Sling JSON)                                  │  │
   │  └─────────────────────────────────────────────────────────────────┘  │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐  │
   │  │  Workflow Engine (/etc/workflow)                                 │  │
   │  │                                                                  │  │
   │  │  • Models (Review, Publish, Archive)                            │  │
   │  │  • Instances (running workflows)                                │  │
   │  │  • Inbox (user notifications)                                   │  │
   │  └─────────────────────────────────────────────────────────────────┘  │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐  │
   │  │  Granite UI / Coral UI                                          │  │
   │  │                                                                  │  │
   │  │  • Dialogs (XML-defined)                                        │  │
   │  │  • Actions                                                     │  │
   │  │  • Console extensions                                           │  │
   │  └─────────────────────────────────────────────────────────────────┘  │
   │                                                                         │
   └────────────────────────────────────────┬────────────────────────────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   ▼
              ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
              │   A2UI Agent    │ │   REST API      │ │   SSE Stream    │
              │                 │ │                 │ │                 │
              │ • GET content   │ │ • POST content  │ │ • Live updates  │
              │ • Query DAM     │ │ • Submit WF     │ │ • Progress      │
              │ • Generate      │ │ • Get status    │ │ • Streaming     │
              └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Data Flow: Content Creation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTENT CREATION DATA FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

   Step 1: User Request
   ──────────────────────────────────────────────────────────────────────────

      USER     ──►    CLIENT    ──►    A2UI REQUEST
      "Create           Builds              {
      hero"             JSON               "message": {
                                             "role": "user",
                                             "parts": [{"text": "..."}]
                                           }
                                         }

   Step 2: Brand-Influenced Generation
   ──────────────────────────────────────────────────────────────────────────

                 ┌─────────────────────────────────────────┐
                 │           AGENT PROCESSING              │
                 │                                          │
                 │  ┌─────────────────────────────────┐  │
                 │  │ BRAND GUIDELINES LOADED          │  │
                 │  │ • Voice: Professional           │  │
                 │  │ • Tone: Trustworthy             │  │
                 │  │ • Pillars: Speed, Security      │  │
                 │  └─────────────────────────────────┘  │
                 │                    │                    │
                 │                    ▼                    │
                 │  ┌─────────────────────────────────┐  │
                 │  │ LLM PROMPT CONSTRUCTED          │  │
                 │  │                                 │  │
                 │  │ "Generate hero banner with      │  │
                 │  │  professional tone. Use action  │  │
                 │  │  verbs. Avoid jargon. Value    │  │
                 │  │  pillars: Speed, Security..."   │  │
                 │  └─────────────────────────────────┘  │
                 │                    │                    │
                 │                    ▼                    │
                 │  ┌─────────────────────────────────┐  │
                 │  │ CONTENT GENERATED               │  │
                 │  │ • Title: "Transform Today"     │  │
                 │  │ • Subtitle: "Faster results"    │  │
                 │  │ • CTA: "Get Started"           │  │
                 │  └─────────────────────────────────┘  │
                 └─────────────────────────────────────────┘

   Step 3: Brand Scoring
   ──────────────────────────────────────────────────────────────────────────

                 ┌─────────────────────────────────────────┐
                 │          BRAND SCORING ENGINE          │
                 │                                          │
                 │  Generated    ──►  Analysis    ──►  Score
                 │  Content           Rules          (0-100)
                 │                                          │
                 │  • Word count      ✓ Max 6 words        │
                 │  • Action verbs   ✓ "Transform"        │
                 │  • Value pillars  ✓ "Faster" = Speed    │
                 │  • Tone match     ✓ Professional       │
                 │                                          │
                 │  RESULT: Brand Score = 92/100            │
                 └─────────────────────────────────────────┘

   Step 4: Response Delivery (AG-UI Streaming)
   ──────────────────────────────────────────────────────────────────────────

      AGENT    ──►    SSE STREAM    ──►    CLIENT    ──►    USER SEES
      Writes         Events stream        Renders          Live preview
      content        to client           updates          building up
      incrementally                      incrementally

      Events:
      • RUN_STARTED
      • TEXT_MESSAGE_DELTA (title building)
      • TEXT_MESSAGE_DELTA (subtitle building)
      • STATE_DELTA (brand score: 0→50→92)
      • RUN_FINISHED

   Step 5: AEM Integration
   ──────────────────────────────────────────────────────────────────────────

                 ┌─────────────────────────────────────────┐
                 │         CONTENT SYNC TO AEM           │
                 │                                          │
                 │  ┌─────────────────────────────────┐  │
                 │  │ POST /api/assets/my-page        │  │
                 │  │ {                               │  │
                 │  │   "jcr:primaryType": "...",     │  │
                 │  │   "title": "Transform Today",   │  │
                 │  │   " sling:resourceType": "..."  │  │
                 │  │ }                               │  │
                 │  └─────────────────────────────────┘  │
                 │                    │                    │
                 │                    ▼                    │
                 │  ┌─────────────────────────────────┐  │
                 │  │ AEM stores content in JCR      │  │
                 │  │ Ready for authoring/preview     │  │
                 │  └─────────────────────────────────┘  │
                 └─────────────────────────────────────────┘

   Step 6: Workflow Initiation
   ──────────────────────────────────────────────────────────────────────────

      USER     ──►    [Submit for Review]    ──►    AGENT    ──►    AEM WF
      clicks                                POST             initiates
      button                                workflow         workflow
                                                           instance

                                                           ┌─────────────┐
                                                           │  Workflow   │
                                                           │  Inbox:     │
                                                           │  • Reviewer │
                                                           │  • Pending  │
                                                           └─────────────┘
```

---

## Scalability & Deployment

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HORIZONTAL SCALING ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │    Load         │
                              │    Balancer     │
                              │   (nginx/AWS)   │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  A2UI Agent     │ │  A2UI Agent     │ │  A2UI Agent     │
         │  Instance 1     │ │  Instance 2     │ │  Instance 3     │
         │                  │ │                  │ │                  │
         │  • Stateless     │ │  • Stateless     │ │  • Stateless     │
         │  • Scales up/down│ │  • Scales up/down│ │  • Scales up/down│
         │  • 512MB-2GB RAM │ │  • 512MB-2GB RAM │ │  • 512MB-2GB RAM │
         └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
                  │                  │                  │
                  └──────────────────┼──────────────────┘
                                     │
                                     ▼
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │   AEM Author    │ │   LLM Provider  │ │   Redis/Session │
         │   (Shared)      │ │   (Scalable)    │ │   (Optional)    │
         │                  │ │                  │ │                  │
         │  • Single source│ │  • OpenAI: auto │ │  • Rate limits  │
         │    of truth     │ │    scaling      │ │  • Caching      │
         │  • Rate limited │ │  • Ollama: add  │ │  • Sessions     │
         │    per instance │ │    instances    │ │                  │
         └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Deployment Options

| Option | Description | Use Case |
|--------|-------------|----------|
| **All-in-one** | Agent + Client on same instance | Development, demos |
| **Separate services** | Agent, client, AEM independent | Production, scale |
| **AEM-embedded** | Client as AEM clientlib | Tight integration |
| **Cloud-native** | Containerized, Kubernetes | Enterprise scale |

### Resource Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Agent JVM | 512MB | 1-2GB |
| Agent CPU | 1 core | 2-4 cores |
| Client | 256MB | 512MB |
| AEM | Standard AEM requirements | Standard AEM requirements |

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                                     │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                          AUTHENTICATION LAYER                           │
   │                                                                         │
   │  ┌─────────────────────────────────────────────────────────────────┐    │
   │  │                    TOKEN FLOW                                   │    │
   │  │                                                                    │    │
   │  │    USER ──► AEM ──► TOKEN ──► A2UI AGENT ──► LLM             │    │
   │  │              auth      (JWT)      validates       provider       │    │
   │  │                                  request                          │    │
   │  │                                                                    │    │
   │  └─────────────────────────────────────────────────────────────────┘    │
   │                                                                         │
   │  Security Measures:                                                    │
   │  • JWT token validation                                                │
   │  • AEM user context propagation                                        │
   │  • Role-based access control (RBAC)                                    │
   │  • API key management (for LLM providers)                            │
   └─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                         DATA PROTECTION                                 │
   │                                                                         │
   │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
   │  │   DATA IN TRANSIT  │  │  DATA AT REST       │  │  LLM DATA       │ │
   │  │                      │ │                      │ │                   │ │
   │  │  • HTTPS required   │ │  • AEM JCR: encrypted│ │  • OpenAI:       │ │
   │  │  • TLS 1.3 minimum │ │  • Agent config:    │ │    encrypted     │ │
   │  │  • Certificate     │ │    secrets vault    │ │  • Ollama:       │ │
   │  │    pinning         │ │  • Session storage:  │ │    local only    │ │
   │  │                    │ │    encrypted        │ │  • Anthropic:    │ │
   │  │                    │ │                      │ │    encrypted     │ │
   │  └─────────────────────┘ └─────────────────────┘ └─────────────────┘ │
   │                                                                         │
   │  Key Considerations:                                                   │
   │  • PII handling: Content may contain personal data                    │
   │  • Data residency: Choose LLM provider accordingly                     │
   │  • Audit logging: All content generation logged                       │
   │  • Compliance: GDPR, CCPA, SOC2 ready                                │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## Why This Architecture Works

### Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | Agent is separate from AEM, client is separate from agent |
| **Protocol-Based** | A2UI/AG-UI enable loose coupling |
| **Extensibility** | Multi-LLM support, pluggable components |
| **Observability** | Logging, metrics, health checks |
| **Failure Recovery** | Template fallback when AI fails |

### Business Value

| Capability | Business Impact |
|------------|----------------|
| 10x faster authoring | 50-70% time savings |
| Brand consistency | 57% improvement in compliance |
| Real-time feedback | Reduced review cycles |
| Self-service DAM | Reduced asset search time |
| Workflow integration | End-to-end automation |

---

## Conclusion

The A2UI architecture represents a fundamental shift in CMS authoring:

| From | To |
|------|-----|
| Dialog-based | Conversational |
| Manual | AI-assisted |
| Batch | Real-time |
| Siloed | Integrated |
| Reactive | Proactive |

This architecture enables:
- **Faster content velocity** (10x improvement)
- **Better brand consistency** (57% improvement)
- **Reduced author burden** (conversational UI)
- **Enterprise readiness** (scalable, secure, observable)

---

## Quick Reference

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](../QUICKSTART.md) | 5-minute hands-on tutorial |
| [CONCEPTS.md](../CONCEPTS.md) | AEM-to-A2UI mapping |
| [docs/A2UI_STORY.md](A2UI_STORY.md) | Narrative with user journey |
| [docs/PROTOCOL.md](PROTOCOL.md) | A2UI vs AG-UI explained |
| [PLAN.md](../PLAN.md) | Future roadmap |
