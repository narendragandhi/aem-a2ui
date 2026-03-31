# A2UI vs AG-UI: Understanding the Protocols

This document explains the two protocols used in this demo and how they work together.

## Quick Summary

| Protocol | Purpose | What It Does |
|----------|---------|--------------|
| **A2UI** | Message Protocol | Defines the structure of requests and responses (content, UI, actions) |
| **AG-UI** | Streaming Protocol | Enables real-time updates via Server-Sent Events (SSE) |

**Think of it this way:**
- **A2UI** = The "what" (what content, what UI, what actions)
- **AG-UI** = The "how fast" (streaming updates as they happen)

---

## A2UI Protocol (Agent-to-User Interface)

**Purpose:** Defines structured messages between AI agents and user interfaces.

### What It Provides

1. **Request Format** - How the client asks the agent for something
2. **Response Format** - How the agent returns content, UI, and actions
3. **Content Structure** - Component type, fields, layout
4. **Action Definitions** - Buttons like "Apply", "Regenerate"

### A2UI Request Example

```json
{
  "message": {
    "role": "user",
    "parts": [{ "text": "Create a hero banner for summer sale" }]
  },
  "accept": ["application/json", "text/html"]
}
```

### A2UI Response Example

```json
{
  "id": "task-123",
  "status": "completed",
  "messages": [{
    "role": "assistant",
    "parts": [{
      "json": {
        "type": "content",
        "content": {
          "componentType": "hero",
          "title": "Summer Savings Event",
          "subtitle": "Up to 50% Off"
        },
        "ui": { "brandScore": 92 },
        "actions": [
          { "id": "apply", "label": "Apply to Page" },
          { "id": "regenerate", "label": "Regenerate" }
        ]
      }
    }]
  }]
}
```

---

## AG-UI Protocol (Agent-Generated User Interface)

**Purpose:** Enables real-time, streaming updates from agents to clients.

### What It Provides

1. **Event Streaming** - Send updates as they happen (not all at once)
2. **Incremental Updates** - "Summer" → "Summer S" → "Summer Sa" → ...
3. **Progress Indicators** - Show when generation starts/finishes
4. **State Synchronization** - Keep client state in sync with agent

### AG-UI Event Types

| Event | Purpose |
|-------|---------|
| `RUN_STARTED` | Generation has begun |
| `TEXT_MESSAGE_START` | Starting to generate a field (e.g., title) |
| `TEXT_MESSAGE_DELTA` | Incremental text update |
| `TEXT_MESSAGE_END` | Field generation complete |
| `STATE_DELTA` | Full content state update |
| `RUN_FINISHED` | Generation complete |
| `RUN_ERROR` | Error occurred |
| `CUSTOM_EVENT` | AEM-specific events (e.g., governance results) |
| `INTERRUPT_REQUESTED` | Human approval required |

### AG-UI Streaming Example

```
event: RUN_STARTED
data: {"runId":"abc-123"}

event: TEXT_MESSAGE_START
data: {"field":"title","messageId":"msg-1"}

event: TEXT_MESSAGE_DELTA
data: {"field":"title","delta":"Summer","content":"Summer"}

event: TEXT_MESSAGE_DELTA
data: {"field":"title","delta":" Savings","content":"Summer Savings"}

event: TEXT_MESSAGE_END
data: {"field":"title"}

event: STATE_DELTA
data: {"delta":{"content":{"title":"Summer Savings","subtitle":...}}}

event: RUN_FINISHED
data: {"runId":"abc-123","status":"completed"}
```

### Custom Events Used in This Demo

The demo emits a `CUSTOM_EVENT` called `governance.result` during governance streaming:

```
event: CUSTOM_EVENT
data: {"name":"governance.result","payload":{"score":88,"issues":[...]}}
```

If the content violates brand rules, the stream may include a HITL event:

```
event: INTERRUPT_REQUESTED
data: {"reason":"brand_violation","details":"Tone mismatch"}
```

---

## How They Work Together

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    A2UI + AG-UI WORKING TOGETHER                             │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐                           ┌──────────┐
   │  CLIENT  │                           │  AGENT   │
   └────┬─────┘                           └────┬─────┘
        │                                      │
        │  A2UI Request                        │
        │  { "message": {...} }                │
        │ ────────────────────────────────────► │
        │                                      │
        │                         ┌────────────┴────────────┐
        │                         │                        │
        │                         │  Generate content       │
        │                         │  Calculate score        │
        │                         │                        │
        │                         └────────────┬────────────┘
        │                                      │
        │  AG-UI Events                        │
        │  (streamed via SSE)                  │
        │ ◄─────────────────────────────────── │
        │                                      │
        │  event: RUN_STARTED                   │
        │  event: TEXT_MESSAGE_DELTA            │
        │  event: TEXT_MESSAGE_DELTA            │
        │  event: STATE_DELTA                   │
        │  event: RUN_FINISHED                  │
        │                                      │
        │  ┌─────────────────────────────────┐ │
        │  │ Live preview updates            │ │
        │  │ "Summer" → "Summer S" → ...    │ │
        │  │ Brand score: 0% → 50% → 92%    │ │
        │  └─────────────────────────────────┘ │
        │                                      │
        │  A2UI Response                       │
        │  { "messages": [{ "parts": [...] }] }│
        │ ◄─────────────────────────────────── │
        │                                      │
```

---

## Analogy

| Concept | Analogy |
|---------|---------|
| **A2UI** | The format of a letter (what you write, how you structure it) |
| **AG-UI** | How the letter is delivered (email with live typing, postal service, etc.) |

You can have:
- A2UI without AG-UI → Letter sent all at once (complete response)
- A2UI with AG-UI → Live-typing email (watch content appear as it's generated)

---

## Why Both?

### Without AG-UI (Batch Response)

```
1. User clicks "Generate"
2. Loading spinner appears (5 seconds)
3. Complete content appears all at once
```

**Problem:** No feedback during generation, feels slow.

### With AG-UI (Streaming Response)

```
1. User clicks "Generate"
2. Immediately: "Summer" appears
3. Watch title build character-by-character
4. Brand score updates: 0% → 50% → 92%
5. Subtitle appears
6. Complete!
```

**Benefit:** Perceives as faster, more engaging, transparent.

---

## Protocol Stack

```
┌─────────────────────────────────────────┐
│            APPLICATION LAYER             │
│                                         │
│  A2UI Protocol (Google)                 │
│  - Request/Response format              │
│  - Content structure                    │
│  - Actions                             │
│                                         │
└────────────────┬────────────────────────┘
                 │
                 │ Uses for streaming
                 ▼
┌─────────────────────────────────────────┐
│           TRANSPORT LAYER               │
│                                         │
│  AG-UI Protocol (Event Streaming)       │
│  - SSE (Server-Sent Events)            │
│  - Real-time updates                    │
│  - Progress indicators                  │
│                                         │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP
                 ▼
┌─────────────────────────────────────────┐
│            NETWORK LAYER                │
│                                         │
│  HTTP/1.1 or HTTP/2                    │
│  REST API endpoints                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## In This Demo

### A2UI Usage

- `AgentController.java` - Handles A2UI requests at `/tasks/run`
- `A2UIMessageBuilder.java` - Builds A2UI-formatted responses
- `ContentSuggestion` model - Maps to A2UI message structure

### AG-UI Usage

- `StreamingController.java` - SSE endpoint at `/stream/generate`
- `StreamingContentService.java` - Emits AG-UI events
- `streaming-content.ts` - Handles AG-UI events on client

---

## References

- **A2UI Protocol**: Google's specification for agent-generated interfaces
- **AG-UI Protocol**: Event streaming protocol for real-time AI updates
- **SSE (Server-Sent Events)**: W3C standard for server-to-client streaming

---

## Quick Reference

| Question | Answer |
|----------|--------|
| What is A2UI? | The format of messages (content + UI + actions) |
| What is AG-UI? | The streaming method (real-time updates) |
| Can I use one without the other? | Yes, but they're designed to work together |
| Is AG-UI required for A2UI? | No, A2UI can work with batch responses |
| Does this demo use both? | Yes - A2UI for structure, AG-UI for streaming |
