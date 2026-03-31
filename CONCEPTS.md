# A2UI Concepts for AEM Developers

This document maps familiar AEM concepts to their A2UI equivalents, helping you connect your existing knowledge to the new protocol.

## Core Terms Comparison

| A2UI Term | AEM Equivalent | Description |
|-----------|----------------|-------------|
| **Agent** | Custom Sling Model / Servlet | The backend logic that processes requests and generates content |
| **A2UI Message** | POJO passed to HTL | Data structure containing content to render |
| **Artifact** | HTL/Sightly Template | Describes how to render the content (layout, styling) |
| **Action** | Granite UI Action | Interactive button or control (Apply, Edit, Regenerate) |
| **Brand Score** | Custom Workflow Step | Real-time evaluation against brand guidelines |
| **Task** | GET/POST Request | A single unit of work in the A2UI protocol |

## Detailed Mapping

### A2UI Message vs Sling Model

**Sling Model (AEM):**
```java
@Component
@Model(adaptables = Resource.class)
public class HeroModel {
    @Inject
    private String title;

    @Inject
    private String subtitle;

    private String ctaText;
    private String ctaUrl;
}
```

**A2UI Message (Equivalent):**
```json
{
  "id": "msg-123",
  "type": "content",
  "content": {
    "componentType": "hero",
    "title": "Summer Savings Event",
    "subtitle": "Up to 50% Off",
    "ctaText": "Shop Now",
    "ctaUrl": "/content/..."
  },
  "ui": {
    "brandScore": 92
  }
}
```

**Key Difference:** A2UI messages are transmitted over HTTP as JSON, while Sling Models are Java objects resolved by the JCR.

---

### Artifact vs HTL Template

**HTL (AEM):**
```html
<div data-sly-use.hero="HeroModel"
     data-sly-resource="${hero.path}"
     class="hero-component">
  <h1>${hero.title}</h1>
  <p>${hero.subtitle}</p>
  <a href="${hero.ctaUrl}">${hero.ctaText}</a>
</div>
```

**A2UI Artifact (Equivalent):**
```json
{
  "artifact": {
    "type": "application/json",
    "root": {
      "componentType": "hero",
      "layout": "split",
      "styles": {
        "backgroundColor": "#f5f5f5",
        "textAlign": "center"
      }
    }
  }
}
```

**Key Difference:** A2UI artifacts define structure in JSON that the frontend renders dynamically. HTL templates are server-side and require page reload.

---

### Action vs Dialog Action

**Dialog Action (AEM):**
```xml
<actions jcr:primaryType="nt:unstructured">
    <action jcr:primaryType="nt:unstructured"
            sling:resourceAction="my-action"
            text="Submit"/>
</actions>
```

**A2UI Action (Equivalent):**
```json
{
  "actions": [
    {
      "id": "apply",
      "label": "Apply to Page",
      "url": "/content/apply",
      "method": "POST"
    },
    {
      "id": "regenerate",
      "label": "Regenerate",
      "command": "regenerate"
    },
    {
      "id": "submit-workflow",
      "label": "Submit for Review",
      "url": "/workflows/submit",
      "method": "POST"
    }
  ]
}
```

**Key Difference:** A2UI actions are defined in the response and rendered client-side. AEM dialog actions are configured in XML.

---

### Brand Score vs Workflow Step

**Custom Workflow Step (AEM):**
```java
public class BrandCheckWorkflowProcess implements WorkflowProcess {
    public void execute(WorkItem workItem, WorkflowSession session) {
        // Check content against brand guidelines
        int score = evaluateBrandCompliance(workItem.getPayload());
        workItem.getWorkflowData().getMetaData().put("brandScore", score);
    }
}
```

**A2UI Brand Score (Equivalent):**
```json
{
  "ui": {
    "brandScore": {
      "overall": 92,
      "breakdown": [
        { "criterion": "Action verbs", "passed": true, "weight": 30 },
        { "criterion": "Value messaging", "passed": true, "weight": 25 },
        { "criterion": "Appropriate tone", "passed": true, "weight": 25 },
        { "criterion": "Avoid words", "passed": true, "weight": 20 }
      ]
    }
  }
}
```

**Key Difference:** Brand score is calculated in real-time during content generation, not as a separate approval step.

---

### Governance Stream vs Approval Step

**AEM Approval Step (Traditional):**
```java
public class ApprovalWorkflowProcess implements WorkflowProcess {
    public void execute(WorkItem workItem, WorkflowSession session) {
        // Wait for review/approval
    }
}
```

**AG-UI Governance Stream (Equivalent):**
```
event: CUSTOM_EVENT (governance.result)
event: INTERRUPT_REQUESTED (requires human approval)
```

**Key Difference:** Governance signals are emitted in real time via streaming events, allowing the UI to interrupt and request approval before changes are applied.

---

## Component Type Mapping

| A2UI Component | AEM Component | Notes |
|----------------|----------------|-------|
| `hero` | Hero Component | Banner with title, subtitle, CTA |
| `teaser` | Teaser Component | Promotional content with image |
| `product-card` | Product Component | Product display with price |
| `text` | Text Component | Rich text paragraph |
| `image` | Image Component | Single image display |
| `button` | Button Component | CTA button |
| `card` | Card Component | Generic card container |
| `carousel` | Carousel Component | Multi-image slider |
| `accordion` | Accordion Component | Collapsible sections |
| `cta` | CTA Component | Call-to-action banner |

---

## Protocol Flow Comparison

### Traditional AEM Authoring Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRADITIONAL AEM FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐     1. Open Dialog      ┌──────────┐
   │  AUTHOR  │ ──────────────────────► │   DIALOG │
   └──────────┘                         └────┬─────┘
                                             │
                                             │ 2. Fill fields
                                             ▼
                                   ┌─────────────────────┐
                                   │  • Title           │
                                   │  • Subtitle        │
                                   │  • Image           │
                                   │  • CTA Text        │
                                   └──────────┬──────────┘
                                              │
                                              │ 3. Click [OK]
                                              ▼
                                   ┌─────────────────────┐
                                   │  SAVE & RENDER     │
                                   │  • HTL executes    │
                                   │  • JCR writes      │
                                   └──────────┬──────────┘
                                              │
                                              │ 4. Preview
                                              ▼
                                   ┌─────────────────────┐
                                   │  Author checks:    │
                                   │  "Is it on-brand?" │
                                   └─────────────────────┘
```

### A2UI Authoring Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              A2UI FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐     1. Natural Language  ┌──────────┐
   │  AUTHOR  │ ──────────────────────► │ ASSISTANT│
   └──────────┘                         └────┬─────┘
                                             │
                                             │ 2. AI Processing
                                             ▼
                                   ┌─────────────────────┐
                                   │  • Parse intent    │
                                   │  • Load brand.json │
                                   │  • Generate content│
                                   │  • Score alignment │
                                   └──────────┬──────────┘
                                              │
                                              │ 3. Live Preview
                                              ▼
                                   ┌─────────────────────┐
                                   │  • Instant render   │
                                   │  • Brand score: 92% │
                                   │  • Variations: 3    │
                                   │  • Actions: Apply   │
                                   └─────────────────────┘
                                              │
                                              │ 4. Click [Apply]
                                              ▼
                                   ┌─────────────────────┐
                                   │  POST to AEM       │
                                   │  • Content written  │
                                   │  • Dialog bypassed  │
                                   └─────────────────────┘
```

---

## Data Flow: Request/Response

### A2UI Request

```json
{
  "message": {
    "role": "user",
    "parts": [
      { "text": "Create a hero banner for our summer sale" }
    ]
  },
  "accept": [
    "text/plain",
    "application/json",
    "text/html"
  ],
  "settings": {
    "brandId": "acme-corp",
    "variations": 3,
    "includeScores": true
  }
}
```

### A2UI Response

```json
{
  "id": "task-456",
  "status": "completed",
  "messages": [
    {
      "id": "msg-789",
      "role": "assistant",
      "parts": [
        {
          "json": {
            "type": "content",
            "content": {
              "componentType": "hero",
              "title": "Summer Savings Event",
              "subtitle": "Up to 50% Off All Products",
              "ctaText": "Shop Now"
            },
            "ui": {
              "brandScore": {
                "overall": 92,
                "breakdown": [
                  { "criterion": "Action verbs", "passed": true },
                  { "criterion": "Tone match", "passed": true }
                ]
              }
            },
            "actions": [
              { "id": "apply", "label": "Apply" },
              { "id": "regenerate", "label": "Regenerate" }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Glossary

| Term | Definition |
|------|------------|
| **A2UI** | Agent-to-User Interface. A protocol for AI agents to generate rich, interactive UIs. |
| **AG-UI** | Event streaming protocol used by A2UI for real-time updates (SSE). |
| **Artifact** | JSON structure defining UI components and layout. |
| **Brand Score** | Numeric (0-100) evaluation of content against brand guidelines. |
| **LLM** | Large Language Model (OpenAI, Anthropic, Ollama, etc.). |
| **SSE** | Server-Sent Events. Technology for streaming updates to the client. |
| **Task** | A single unit of work in A2UI protocol (request → response). |
| **Variation** | Alternative version of generated content (original, bold, friendly). |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    A2UI QUICK REFERENCE CARD                                 │
└─────────────────────────────────────────────────────────────────────────────┘

   AEM Concept          →   A2UI Equivalent
   ─────────────────────────────────────────
   Sling Model         →   A2UI Message
   HTL Template        →   Artifact
   Dialog Action       →   Action
   Workflow Step       →   Brand Score
   Component Dialog   →   Form Request
   JCR Write          →   POST /content

   Protocol Steps:
   ─────────────────────────────────────────
   1. Client builds A2UI request
   2. POST to /tasks/run
   3. Agent processes with LLM/templates
   4. Returns JSON with content + UI
   5. Client renders interactive preview
   6. User clicks action (Apply, etc.)
   7. Agent POSTs to AEM endpoint
```

---

## Related Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute tutorial
- **[docs/A2UI_STORY.md](docs/A2UI_STORY.md)** - Narrative guide with diagrams
- **[PLAN.md](PLAN.md)** - Future features
- **[CLAUDE.md](CLAUDE.md)** - Technical decisions
