# AEM A2UI

An AI-powered content assistant for Adobe Experience Manager (AEM) that demonstrates the power of a "Brand-Aware AI" to generate on-brand content with real-time streaming using the full AG-UI protocol.

## Project Overview

This project is a sophisticated prototype of an AI-powered authoring assistant for Adobe Experience Manager (AEM). It showcases a "Brand-Aware AI" capable of generating content that strictly adheres to predefined brand guidelines.

**Core Technologies:**

- **A2UI Protocol v0.8:** Google's Agent-to-User Interface protocol for generating rich, interactive UIs.
- **AG-UI Protocol v2.0:** Full implementation with all 17 event types for real-time streaming.
- **Embabel Agent Framework:** A powerful AI agent framework for the JVM.
- **Multi-LLM Support:** Integrates with OpenAI, Anthropic, and Ollama (for local development).
- **Adobe Spectrum:** Adobe's official design system for a professional and intuitive UI.
- **Real AEM SDK Integration:** Live connection to AEM Author with DAM search, content creation, and workflow support.

## Understanding A2UI vs AG-UI

This project uses two complementary protocols:

| Protocol | Purpose | Example |
|----------|---------|---------|
| **A2UI** | Message format for rich UIs | Defines content, UI, actions |
| **AG-UI** | Real-time streaming (17 events) | Updates appear as they're generated |

### AG-UI Protocol - Full Implementation (17 Event Types)

This project implements the **complete AG-UI protocol** with all 17 event types:

| Category | Events | Description |
|----------|--------|-------------|
| **Lifecycle** | `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED` | Agent run lifecycle tracking |
| **Text Message** | `TEXT_MESSAGE_START`, `TEXT_MESSAGE_DELTA`, `TEXT_MESSAGE_END` | Streaming text generation |
| **Tool Call** | `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT` | Real-time tool execution (e.g., AEM DAM search) |
| **State** | `STATE_DELTA`, `STATE_SNAPSHOT`, `MESSAGES_SNAPSHOT` | State synchronization for UI recovery |
| **Extension** | `RAW_EVENT`, `CUSTOM_EVENT` | AEM-specific events (e.g., `aem.content.ready`) |
| **HITL** | `INTERRUPT_REQUESTED`, `INTERRUPT_RESOLVED` | Human-in-the-Loop approval |

**See [docs/PROTOCOL.md](docs/PROTOCOL.md)** for a detailed explanation of both protocols and how they work together.

### Architecture Deep Dive

For a technical architectural perspective including integration patterns, scalability, and deployment strategies, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

### Brand Alignment Scoring (Textual & Visual)

To provide authors with immediate feedback, the application includes a comprehensive brand alignment scoring system. This feature analyzes generated content and provides a score indicating how well it aligns with the brand guidelines, along with a list of factors that contributed to the score. This now includes both textual and visual alignment.

### Visual Brand Alignment

The AI now considers visual brand guidelines when suggesting images. The `brand-config.json` includes `visuals` properties (e.g., `styleKeywords`, `brandColors`). The AI selects images from a predefined library that best match these visual cues. In the live preview, a **"Brand Aligned"** or **"Review Visual"** badge appears on images, indicating their adherence to the brand's visual style.

### SEO Optimization

A new SEO analysis panel provides real-time feedback on the generated content's search engine optimization. For each generated content piece, the panel displays:

-   An overall **SEO Score**.
-   **Suggested Meta Title and Meta Description** based on the content.
-   **Recommended Keywords** relevant to the component type and content.
-   A **Readability Score** to ensure content is easy to digest.
-   Identified **Issues** (e.g., sub-optimal title length, missing keywords).

This feature empowers authors to create content that is not only on-brand but also optimized for search engines.

### Brand-Aware AI

The cornerstone of this demo is its "Brand-Aware AI." The AI's content generation is guided by a `brand-config.json` file, which defines the brand's voice, tone, messaging pillars, and includes examples of on-brand content. This ensures that all generated content is consistent with the brand's identity.

### Advanced Client-Side Features

The client is a feature-rich application built with Adobe's Spectrum design system and includes:

- **Content Wizard:** A guided, 3-step process for creating content.
- **Page Builder:** A multi-page builder with drag-and-drop functionality for creating complex layouts.
- **AEM Authoring Preview:** A realistic simulation of the AEM authoring environment, complete with Edit, Preview, and Structure modes.
- **Multiple Input Modes:** Switch between a guided wizard, a quick-entry text field, and a full page builder.
- **Inline Editing:** Click to edit text directly in the live preview.
- **Component Library:** A rich library of 20 component types across 7 categories.
- **AG-UI Demo Hub:** Curated demos for workflow orchestration, governance, component config, DAM assembly, personalization, and experience fragments.
- **Guided Narrative Mode:** Story-driven stepper with progress tracking and event log.
- **Telemetry Panel:** Live view of demo/agent events with a summary feed.
- **Content Fragment Sync:** Save and update content fragments directly from the assistant.
- **Deterministic Demo Mode:** Use `/?demo=1` for stable demo content and visual tests.

### Demo Feature Flag

Set `aem.demo.enabled=false` to disable demo-only endpoints (e.g., `/demo/*`, `/stream/governance`).

### Sophisticated Agent Backend

The Java-based agent leverages the Embabel AI framework and provides features such as:

- **Multiple Variation Generation:** Generates three variations for each content request: "original," "bold and impactful," and "friendly and conversational."
- **Pluggable LLM Providers:** Easily switch between different LLM providers with graceful fallback to template-based generation.
- **Governance Streaming:** SSE stream for compliance checks with HITL interrupt signals.
- **Component Mapping:** Maps AI suggestions to AEM component properties for apply/update flows.
- **Telemetry Capture:** Aggregates agent activity for demo observability.

## Project Structure

```
aem-a2ui/
├── README.md                 # This file
├── agent/                    # Python agent (FastAPI) - Basic Demo
├── agent-java/               # Java agent (Spring Boot) - Advanced Features
└── client/                   # Web client (Lit + Adobe Spectrum)
```

## Getting Started

### Quick Start (5 minutes)

Follow the **[QUICKSTART.md](QUICKSTART.md)** for a hands-on tutorial.

### Understand the Concepts

See **[CONCEPTS.md](CONCEPTS.md)** for AEM-to-A2UI concept mapping.

### Learn Why A2UI Matters

See **[docs/VALUE_PROPOSITION.md](docs/VALUE_PROPOSITION.md)** for the business case.

### Read the Full Story

See **[docs/A2UI_STORY.md](docs/A2UI_STORY.md)** for a narrative guide with diagrams.

### Architecture Deep Dive

For technical architects, see **[ARCHITECTURE.md](ARCHITECTURE.md)** for:
- Problem analysis and solution approach
- Integration patterns with AEM
- Scalability and deployment strategies
- Security architecture
- Trade-offs and decisions

### Plan Future Work

See **[PLAN.md](PLAN.md)** for upcoming features.

---

## Prerequisites

- Java 21+ and Maven (for the Java agent)
- Node.js 18+ (for the client)
- (Optional) Ollama for local AI generation

### 1. Start the Java Agent

**Without AI (Template-based):**

```bash
cd agent-java
mvn spring-boot:run
```

**With AI (using Ollama):**

First, ensure Ollama is running and has a model available (e.g., `ollama run llama3.2`).

```bash
cd agent-java
AI_ENABLED=true LLM_PROVIDER=ollama mvn spring-boot:run
```

### 2. Start the Client

```bash
cd client
npm install
npm run dev
```

### 3. Open in Browser

Navigate to `http://localhost:5173` to see the application in action.

## Streaming Endpoints

The project provides multiple streaming endpoints for real-time content generation:

| Endpoint | Description | Events |
|----------|-------------|--------|
| `/stream/generate` | Basic SSE streaming | Lifecycle + Text Message events |
| `/stream/advanced` | Full AG-UI with AEM DAM integration | All 17 event types |
| `/stream/raw` | Raw LLM token streaming | Raw tokens as generated |
| `/stream/health` | Protocol health check | Lists all supported events |
| `/stream/governance` | Governance streaming for compliance checks | CUSTOM_EVENT + HITL |

### Example: Advanced Streaming Workflow

```
STEP 1: 🔍 Analyzing request...    → STEP_STARTED (parse_intent)
STEP 2: 🖼️ Searching AEM DAM...   → TOOL_CALL_START (aem_dam_search)
STEP 3: ✨ Generating content...   → TEXT_MESSAGE_DELTA (streaming)
STEP 4: 📤 Delivering content...   → STATE_SNAPSHOT (recovery)
→ CUSTOM_EVENT: aem.content.ready
→ RUN_FINISHED
```

## AEM SDK Integration

Real integration with local AEM SDK:

| Feature | Status | Description |
|---------|--------|-------------|
| **DAM Browse/Search** | ✅ | Browse folders, search assets with MIME filters |
| **Content Creation** | ✅ | Create pages and content fragments |
| **Workflow Submit** | ✅ | Submit to AEM workflow engine |
| **Health Check** | ✅ | Automatic connection monitoring |
| **GraphQL** | ✅ | Content Fragment queries |
| **Webhooks** | ✅ | AEM event handlers |

## Demo Endpoints

Demo-only endpoints (controlled by `aem.demo.enabled`) provide curated, deterministic responses:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/demo/governance/check` | POST | Run governance checks on sample content |
| `/demo/component-schema` | GET | Return component configuration schema |
| `/demo/dam-assembly` | POST | Suggest DAM asset assembly |
| `/demo/personalize` | POST | Provide persona-based variations |
| `/demo/localize` | POST | Localize content variants |
| `/demo/xf` | POST | Generate experience fragment proposals |

## Quality & Testing

- **Checkstyle + JaCoCo:** Enforced for Java code style and coverage reporting.
- **Playwright Visual Regression:** Screenshot-based UI regression tests in `client/tests/visual`.

## Features Implemented

- [x] Full AG-UI Protocol (17 event types)
- [x] Real-time SSE streaming with word-by-word updates
- [x] Multi-step workflow visualization with icons
- [x] Tool call visualization (AEM DAM search)
- [x] State synchronization for UI recovery
- [x] Direct AEM SDK integration (DAM, Content, Workflows)
- [x] Brand alignment scoring (textual + visual)
- [x] 20 component types across 7 categories
- [x] Collaborative review workflow
- [x] Universal Editor integration
- [x] AI-driven component recommendations
- [x] Multi-LLM support (OpenAI, Anthropic, Ollama)
- [x] Governance streaming with HITL interrupts
- [x] Guided narrative demo mode
- [x] Telemetry panel
- [x] Visual regression tests (Playwright)

## Future Enhancements

- [x] Human-in-the-Loop approval (INTERRUPT_REQUESTED/RESOLVED)
- [x] Real-time progress bars (STATE_DELTA events)
- [ ] Multi-language support
- [ ] Custom brand config upload UI
- [ ] A/B testing for content variations
- [ ] Enterprise SSO (Adobe IMS)

## License

Apache 2.0
