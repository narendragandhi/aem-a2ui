# AEM A2UI Demo - Claude Development Notes

This file documents key decisions, architecture choices, and updates made during development.

## Project Overview

An AI-powered content assistant for Adobe Experience Manager (AEM) using:
- **A2UI Protocol v0.8** - Google's Agent-to-User Interface protocol
- **Embabel Agent Framework** - Rod Johnson's AI agent framework for JVM
- **Multi-LLM Support** - OpenAI, Anthropic, and Ollama (local)
- **Adobe Spectrum** - Adobe's official design system for professional UI
- **Brand-Aware AI** - Content generation that follows brand guidelines

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Client (Lit)                        │
│  - Two-pane layout: Suggestions | Live Preview              │
│  - Component-based architecture                             │
│  - Copy JSON/HTML export                                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Java Agent (Spring Boot 3.2)                   │
│  - Embabel Agent Framework integration                      │
│  - Multi-LLM provider (OpenAI/Anthropic/Ollama)            │
│  - A2UI message generation                                  │
│  - Multiple variation generation                            │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. Embabel Framework Integration

**Problem**: `embabel-agent-starter` had bytecode incompatibility with Spring Boot's ASM library.

**Solution**: Use `embabel-agent-api` (v0.3.1) instead of the full starter.
- Provides annotations (@Agent, @Action, @AchievesGoal) without problematic auto-configuration
- Works cleanly with Spring Boot 3.2.0

```xml
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-api</artifactId>
    <version>0.3.1</version>
</dependency>
```

### 2. Multi-LLM Provider Architecture

**Design**: Pluggable LLM providers with graceful fallback.

```java
LlmService.generate(prompt) -> switch(provider) {
    case "openai" -> generateWithOpenAI(prompt);
    case "anthropic" -> generateWithAnthropic(prompt);
    case "ollama" -> generateWithOllama(prompt);
}
```

**Configuration** (via environment variables):
- `AI_ENABLED=true` - Enable AI mode
- `LLM_PROVIDER=ollama` - Choose provider
- `OLLAMA_MODEL=llama3.2` - Model selection

**Fallback**: When LLM fails or is disabled, falls back to template-based generation.

### 3. Client Architecture Refactoring

**Structure**:
```
client/src/
├── aem-assistant.ts      # Main component
├── spectrum-imports.ts   # Adobe Spectrum Web Components
├── components/
│   ├── assistant-header.ts
│   ├── assistant-input.ts
│   ├── assistant-preview.ts
│   ├── assistant-suggestions.ts
│   ├── content-wizard.ts    # Guided wizard (20 component types)
│   ├── brand-panel.ts       # Brand guidelines display
│   ├── brand-score.ts       # Content alignment scoring
│   ├── page-builder.ts      # Multi-page builder with drag-drop
│   ├── aem-preview.ts       # AEM authoring chrome preview
│   └── error-message.ts
├── data/
│   └── brand-config.json    # Brand guidelines configuration
├── lib/
│   └── types.ts
└── services/
    └── history-service.ts
```

**Features**:
- Adobe Spectrum design system integration
- Three input modes: Guided Wizard, Quick Mode, Page Builder
- 20 component types across 7 categories
- Brand guidelines panel with live status
- Brand alignment scoring for generated content
- Multi-page builder with drag-drop reordering
- AEM authoring preview with Edit/Preview/Structure modes
- Responsive device preview (Desktop/Tablet/Mobile)
- Copy to clipboard (JSON and HTML formats)
- Refinement input for iterating on suggestions

### 6. Intuitive Content Wizard

**Problem**: Users found the free-form text input unintuitive.

**Solution**: Added a guided 3-step wizard for content creation.

**Step 1 - Choose Type**: Visual cards with icons for each component type
- Hero Banner, Product Card, Teaser, Promo Banner
- Each card shows description and use case

**Step 2 - Customize**:
- Tone selector (Professional, Playful, Urgent, Elegant)
- Image style selector (Photography, Illustration, Abstract, Minimal)
- Description input with quick example chips

**Step 3 - Review & Generate**: Summary of selections before generation

**Implementation**:
```typescript
// content-wizard.ts
const COMPONENT_TYPES = [
  { id: 'hero', name: 'Hero Banner', icon: 'icon', description: '...' },
  // ...
];

const TONES = [
  { id: 'professional', name: 'Professional', icon: 'icon' },
  // ...
];
```

### 7. Inline Editing in Preview

**Feature**: Click-to-edit functionality in the live preview.

**Implementation**:
- Toggle "Edit" mode in preview header
- Click any text field (title, subtitle, description, CTA)
- Inline input appears for editing
- Press Enter to save, Escape to cancel
- Changes update the content model in real-time

```typescript
// assistant-preview.ts
private renderEditableField(field: string, value: string, tag: string) {
  if (this.editMode && this.editingField === field) {
    return html`<input class="editable-input" ... />`;
  }
  return html`<${tag} class="editable" @click=${...}>${value}</${tag}>`;
}
```

### 8. View Mode Toggle

**Design**: Users can switch between three input modes:
- **Guided Mode**: Step-by-step wizard for structured input
- **Quick Mode**: Free-form text input for experienced users
- **Page Builder Mode**: Multi-page layout builder with drag-drop

Toggle buttons at the top of the left panel allow instant switching.

### 13. Multi-Page Builder

**Feature**: Build complete page layouts with multiple components using drag-drop.

**Page Templates**:
- Landing Page: navigation → hero → 3 teasers → cta → footer
- Product Page: navigation → hero → product → tabs → quote → cta → footer
- Blog Article: navigation → hero → teaser → accordion → social → footer
- Custom Page: Start from scratch

**Implementation** (`page-builder.ts`):
```typescript
const PAGE_TEMPLATES = [
  { id: 'landing', name: 'Landing Page', icon: '🚀',
    sections: ['navigation', 'hero', 'teaser', 'teaser', 'teaser', 'cta', 'footer'] },
  // ...
];

// Drag and drop support
private handleDragStart(e: DragEvent, index: number)
private handleDrop(e: DragEvent, dropIndex: number)

// Generate all content in sequence
private async generateAllContent() {
  for (section of sections) {
    this.dispatchEvent(new CustomEvent('generate-section', {
      detail: { sectionId, componentType, prompt, pageContext }
    }));
  }
}
```

**Features**:
- 4 pre-built page templates
- 17 component types available
- Drag-and-drop section reordering
- Page description context for AI generation
- Sequential content generation with progress indicator

### 14. AEM Authoring Preview

**Feature**: Realistic AEM authoring environment simulation.

**View Modes**:
- **Preview**: Clean page preview
- **Edit**: Shows AEM component chrome with edit actions
- **Structure**: JCR content tree visualization

**Implementation** (`aem-preview.ts`):
```typescript
@customElement('aem-preview')
export class AemPreview extends LitElement {
  @property({ type: Array }) sections: PageSection[] = [];
  @property({ type: String }) viewMode: 'preview' | 'edit' | 'structure' = 'preview';
  @state() private deviceMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';

  // AEM toolbar with logo, view modes, device toggle
  private renderToolbar()

  // Component with edit chrome showing path and actions
  private renderComponent(section: PageSection)

  // JCR tree structure view
  private renderStructureView()
}
```

**Features**:
- AEM-style dark toolbar with logo
- Preview/Edit/Structure mode toggle
- Desktop/Tablet/Mobile responsive preview
- Component chrome with edit/configure/delete actions
- JCR path display (/content/site/page/jcr:content/...)
- Publish button simulation

### 4. Multiple Variations Generation

**Approach**: Generate 3 variations per request with different styles:
1. Original (from user prompt)
2. "Bold and impactful" style
3. "Friendly and conversational" style

**Implementation**:
```java
SuggestionsResult generateMultipleSuggestions(String userInput, int count) {
    // Parse intent once
    UserInput parsed = contentAgent.parseUserIntent(userInput);

    // Generate variations with different styles
    for (style : styles) {
        variations.add(contentAgent.generateContent(variantInput));
    }

    return new SuggestionsResult(messages, artifacts);
}
```

### 5. Vite Configuration

**Issue**: `xdg-open ENOENT` errors in containerized environments.

**Solution**: Disable auto-browser opening:
```typescript
// vite.config.ts
server: {
    port: 5173,
    open: false,  // Prevents xdg-open errors in Docker
}
```

## Component Types (20 Total)

| Category | Components |
|----------|------------|
| **Marketing** | Hero Banner, Promo Banner, Carousel |
| **Content** | Teaser, Quote/Testimonial, Accordion, Tabs |
| **Commerce** | Product Card, Product List, Pricing Table |
| **Media** | Video Player, Image Gallery |
| **Navigation** | Navigation Menu, Footer, Breadcrumb |
| **Interactive** | Form, Search, Call to Action |
| **Social** | Social Share, Team Grid |

### Category Filtering
Users can filter components by category using chips at the top of the wizard.
Grid layout adapts (3 columns) with scrollable area for easy navigation.

### 9. Adobe Spectrum Design System

**Integration**: Full Adobe Spectrum Web Components for professional look.

```typescript
// spectrum-imports.ts
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
// ... more components
```

**Usage**:
- `<sp-theme>` wrapper for theming
- `<sp-button>` for actions
- `<sp-action-group>` for mode toggles
- Spectrum design tokens (--spectrum-*) for colors

### 10. Brand-Aware AI Content Generation

**Problem**: Generated content lacks brand consistency.

**Solution**: Comprehensive brand guidelines injected into every LLM prompt.

**Brand Config** (`client/src/data/brand-config.json`):
```json
{
  "brand": { "name": "Acme Corp", "tagline": "Innovation for Tomorrow" },
  "voice": {
    "tone": ["Professional", "Innovative", "Trustworthy"],
    "avoid": ["Jargon", "Passive voice", "Superlatives"]
  },
  "messaging": {
    "valuePillars": ["Speed & Efficiency", "Enterprise Security", "Seamless Integration"],
    "targetAudience": "Enterprise IT decision-makers"
  },
  "examples": {
    "goodHeadlines": ["Transform Your Workflow in Minutes", "Security That Scales With You"]
  }
}
```

**LLM Prompt Injection** (`AemContentAgent.java`):
```java
public static final String BRAND_GUIDELINES = """
    === BRAND GUIDELINES FOR ACME CORP ===
    BRAND VOICE: Professional, Innovative, Trustworthy
    WRITING RULES:
    - Headlines: Bold, concise, action-oriented (max 6 words)
    - Use action verbs: Transform, Discover, Unlock, Accelerate
    - AVOID: Jargon, passive voice, superlatives
    VALUE PILLARS: Speed & Efficiency, Enterprise Security, Seamless Integration
    === END BRAND GUIDELINES ===
    """;
```

### 11. Brand Alignment Scoring

**Feature**: Visual indicator showing how well content aligns with brand.

**Score Calculation** (`brand-score.ts`):
```typescript
public static calculateScore(content) {
  let score = 70; // Base score

  // Check for action-oriented headline
  if (actionWords.some(word => content.title.includes(word))) {
    score += 8;
    factors.push('Action-oriented headline');
  }

  // Check for value-focused messaging
  if (valueWords.some(word => content.description.includes(word))) {
    score += 7;
    factors.push('Value pillar messaging');
  }

  return { score, factors };
}
```

**Display**:
- 85%+ = "Excellent" (green)
- 65-84% = "Good" (yellow)
- <65% = "Needs Work" (red)
- Lists matched brand factors

### 12. Brand Panel

**Component**: Collapsible panel showing loaded brand guidelines.

**Features**:
- "Active & Loaded" status indicator
- Voice & tone tags
- Color swatches from brand config
- Value pillars list
- "Avoid" warnings
- Example headlines

## API Endpoints

### Java Agent (port 10003)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/.well-known/agent-card.json` | GET | A2A agent discovery |
| `/tasks` | POST | Generate content suggestions |
| `/actions/{name}` | POST | Handle UI actions |

### Request Format
```json
{
  "message": {
    "role": "user",
    "parts": [{ "text": "Hero banner for summer sale" }]
  }
}
```

### Response Format
```json
{
  "id": "task-uuid",
  "status": "completed",
  "messages": [...],  // A2UI messages
  "artifacts": [...]  // Raw suggestion data
}
```

## Running the Demo

### Quick Start (Template Mode)
```bash
# Start Java agent
cd agent-java && mvn spring-boot:run

# Start client
cd client && npm run dev
```

### With Ollama (AI Mode)
```bash
# Start Ollama with a model
ollama run llama3.2

# Start Java agent with AI enabled
cd agent-java
AI_ENABLED=true LLM_PROVIDER=ollama mvn spring-boot:run

# Start client
cd client && npm run dev
```

## Testing

### Client Tests
```bash
cd client && npm test
```

### Java Tests
```bash
cd agent-java && mvn test
```

### Storybook (Component Development)
```bash
cd client && npm run storybook
```

**Storybook Stories** (13 components covered):

| Component | Stories | Description |
|-----------|---------|-------------|
| assistant-header | 1 | Agent selector header |
| assistant-input | 1 | Content input field |
| assistant-suggestions | 4 | Empty, WithSuggestions, WithSelected, WithError |
| assistant-preview | 5 | Empty, Hero, Product, Teaser, Banner |
| error-message | 1 | Error display |
| content-wizard | 4 | Step-by-step wizard for component creation |
| brand-panel | 3 | Brand guidelines display (Collapsed, InSidebar) |
| page-builder | 3 | Template selection, multi-section builder |
| aem-preview | 5 | Preview/Edit/Structure modes, generating states |
| workflow-panel | 3 | Workflow selection, approval states |
| review-panel | 4 | No review, Pending, Approved, With comments |
| dam-browser | 5 | DAM asset browser modal |
| aem-status | 5 | Connection status indicator |

**Run Storybook:**
```bash
cd client && npm run storybook   # Dev server on port 6006
cd client && npm run build-storybook  # Static build
```

## Value Proposition

1. **Speed**: Generate AEM content in seconds vs hours of manual creation
2. **Brand Consistency**: AI follows brand guidelines with real-time scoring
3. **Professional Design**: Adobe Spectrum design system for polished UI
4. **Flexibility**: 20 component types, multiple variations per request
5. **Export Ready**: Copy JSON/HTML directly into AEM

## Workflow & Collaborative Review

### 15. Collaborative Review System

**Feature**: Multi-user content review with comments and approval workflow.

**Components**:
- `review-panel.ts` - Review status, reviewers, approve/reject actions
- `review-comments.ts` - Threaded comments with field-level annotations

**Review Status Flow**:
```
Draft → Pending Review → In Review → Approved/Rejected/Changes Requested
```

**Backend**:
- `ReviewService.java` - Review management with in-memory storage
- `ReviewController.java` - REST endpoints for reviews and comments

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reviews` | POST | Create new review |
| `/reviews/{id}` | GET | Get review details |
| `/reviews/{id}/comments` | POST | Add comment |
| `/reviews/{id}/approve` | POST | Approve review |
| `/reviews/{id}/reject` | POST | Reject review |
| `/reviews/content/{id}/versions` | GET | Version history |

### 16. AEM Workflow Integration

**Feature**: Submit approved content to AEM workflow engine.

**Workflow Models**:
- **Request for Publication** - Content review before publishing
- **Request for Activation** - Immediate activation
- **Review and Approve** - Multi-step approval
- **Translation Request** - Localization workflow

**Components**:
- `workflow-panel.ts` - Workflow selection and status tracking
- `WorkflowService.java` - Workflow submission and tracking
- `WorkflowController.java` - REST endpoints

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/workflows/models` | GET | List workflow models |
| `/workflows/submit` | POST | Submit to workflow |
| `/workflows/{id}/status` | GET | Get status |
| `/workflows/{id}/advance` | POST | Complete step |
| `/workflows/{id}` | DELETE | Cancel workflow |

**Integration Flow**:
```
Content Generated → Start Review → Add Comments → Approve →
Submit to Workflow → Complete Steps → Published
```

## Real AEM SDK Integration

### 17. AEM SDK Connection

**Feature**: Real integration with local AEM SDK instance.

**Configuration** (`application.properties`):
```properties
# Enable/disable real AEM integration
aem.enabled=${AEM_ENABLED:true}

# AEM instance URLs
aem.author-url=${AEM_AUTHOR_URL:http://localhost:4502}

# Credentials
aem.username=${AEM_USERNAME:admin}
aem.password=${AEM_PASSWORD:admin}

# Content paths
aem.content-root=/content/aem-demo
aem.dam-root=/content/dam/aem-demo
```

**Architecture**:
```
┌──────────────────────────────────────────────────┐
│                Spring Boot Backend               │
│  ├── AemHttpClient (Base HTTP with auth)        │
│  ├── AemWorkflowClient (Workflow API)           │
│  ├── AemContentClient (Content storage)         │
│  └── AemDamClient (DAM operations)              │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│              AEM SDK (Local)                     │
│  http://localhost:4502                           │
│  ├── /etc/workflow/* (Workflow API)             │
│  ├── /content/* (Content Storage)               │
│  └── /content/dam/* (DAM Assets)                │
└──────────────────────────────────────────────────┘
```

**Backend Services**:
- `AemHttpClient.java` - Base HTTP client with Basic Auth
- `AemWorkflowClient.java` - Submit/manage real AEM workflows
- `AemContentClient.java` - Create pages and content fragments
- `AemDamClient.java` - Browse, search, and select DAM assets

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/aem/health` | GET | Check AEM connection status |
| `/aem/config` | GET | Get AEM configuration |
| `/aem/content` | POST | Save content to AEM |
| `/dam/browse` | GET | List assets in folder |
| `/dam/search` | GET | Search DAM assets |
| `/dam/asset` | GET | Get asset details |

### 18. DAM Browser

**Feature**: Browse and select assets from AEM DAM.

**Frontend Component** (`dam-browser.ts`):
- Modal overlay for asset selection
- Folder navigation in sidebar
- Asset grid with thumbnails
- Search with MIME type filtering
- Type filters: All, Images, Videos, Documents

**Usage**:
```typescript
<dam-browser
  .open=${this.showDamBrowser}
  @close=${() => this.showDamBrowser = false}
  @asset-selected=${this.handleDamAssetSelected}
></dam-browser>
```

### 19. AEM Connection Status

**Feature**: Real-time AEM connection indicator.

**Frontend Component** (`aem-status.ts`):
- Status dot: Green (connected), Red (disconnected), Gray (disabled)
- Dropdown with connection details
- Test Connection button
- Open AEM link when connected

**Status States**:
- **Connected**: Real AEM integration active
- **Disconnected**: AEM unreachable, using mock mode
- **Mock Mode**: AEM integration disabled via config

### AEM SDK Setup

**1. Start AEM SDK**:
```bash
java -jar aem-author-p4502.jar
```

**2. Configure CORS** (create in AEM):
```
/apps/aem-demo/osgiconfig/config/com.adobe.granite.cors.impl.CORSPolicyImpl-demo.cfg.json
```
```json
{
  "alloworigin": ["http://localhost:5173", "http://localhost:10003"],
  "allowedpaths": ["/content/.*", "/api/.*", "/etc/.*", "/bin/.*"],
  "supportedmethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "supportedheaders": ["Authorization", "Content-Type", "Accept"],
  "supportscredentials": true
}
```

**3. Create Content Structure**:
```
/content/aem-demo/          # Site root
/content/dam/aem-demo/      # DAM folder for assets
```

### Running with AEM Integration

```bash
# Start AEM SDK
java -jar aem-author-p4502.jar

# Start Java backend with AEM enabled
cd agent-java
AEM_ENABLED=true mvn spring-boot:run

# Start frontend
cd client && npm run dev
```

## AEM Universal Editor Integration

### 20. Universal Editor Support

**Feature**: Integration with AEM Universal Editor for inline content authoring.

**Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    AEM Universal Editor                         │
│  - Channel-agnostic authoring                                   │
│  - Properties Rail for field editing                            │
│  - Component insertion/reordering                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ data-aue-* attributes
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Lit Web Components                             │
│  - Instrumented with UE attributes                              │
│  - Component models define editable properties                  │
│  - Content sourced from AEM or generated by AI                  │
└─────────────────────────────────────────────────────────────────┘
```

**Component Definition Files** (`client/src/aue/`):
```
aue/
├── component-models.json      # Field definitions for properties panel
├── component-definitions.json # Component registry with grouping
├── component-filters.json     # Context-aware component filtering
├── universal-editor.ts        # UE helper utilities
└── index.ts                   # Module exports
```

**Supported Components**:
| Component | Model | Fields |
|-----------|-------|--------|
| Hero Banner | hero-banner | title, subtitle, description, ctaText, ctaUrl, imageUrl |
| Teaser | teaser | title, description, ctaText, ctaUrl, imageUrl |
| Product Card | product-card | title, description, price, ctaText, imageUrl |
| CTA Banner | cta-banner | title, description, ctaText, ctaUrl |
| Quote | quote | quote, author, title, imageUrl |
| Navigation | navigation | title, imageUrl, items |
| Footer | footer | title, description, items |

**Usage in Components**:
```typescript
import { initUniversalEditor, getEditableAttributes, getFieldAttributes } from '../aue';

// Initialize UE
initUniversalEditor({
  aemAuthorUrl: 'http://localhost:4502',
  contentPath: '/content/my-site',
  enabled: true,
});

// In render():
const componentAttrs = getEditableAttributes(content, 'hero');
const titleAttrs = getFieldAttributes('title');
```

**Enable in AEM Preview**:
```typescript
<aem-preview
  .sections=${sections}
  .ueConfig=${{ enabled: true, aemAuthorUrl: 'http://localhost:4502' }}
></aem-preview>
```

**Integration Options**:
1. **Universal Editor** (Recommended) - For AEM as a Cloud Service
2. **Traditional HTL** - For AEM 6.5 with ClientLibs
3. **Headless** - Content Fragments + GraphQL

---

## AG-UI & A2UI Protocol Features

### 21. Full AG-UI Protocol Implementation (17 Event Types)

**Feature**: Complete AG-UI protocol support with real-time streaming, multi-step workflows, tool call visualization, and state management.

Implements ALL 17 AG-UI protocol event types organized into 5 categories:

**Lifecycle Events**:
| Event | Description |
|-------|-------------|
| `RUN_STARTED` | Agent run begins with metadata (agentName, version, capabilities) |
| `RUN_FINISHED` | Run completes successfully |
| `RUN_ERROR` | Error occurred with recovery info |
| `STEP_STARTED` | Multi-step workflow step begins (with icon, title, description) |
| `STEP_FINISHED` | Step completes with result |

**Text Message Events**:
| Event | Description |
|-------|-------------|
| `TEXT_MESSAGE_START` | New field generation starts |
| `TEXT_MESSAGE_DELTA` | Incremental text update (word by word) |
| `TEXT_MESSAGE_END` | Field complete |

**Tool Call Events** (NEW):
| Event | Description |
|-------|-------------|
| `TOOL_CALL_START` | Tool execution begins (e.g., AEM DAM search) |
| `TOOL_CALL_ARGS` | Tool arguments streamed |
| `TOOL_CALL_END` | Tool execution completes |
| `TOOL_CALL_RESULT` | Tool output with results |

**State Management Events** (NEW):
| Event | Description |
|-------|-------------|
| `STATE_DELTA` | Incremental state update |
| `STATE_SNAPSHOT` | Full state for UI recovery/reconnection |
| `MESSAGES_SNAPSHOT` | Full conversation history |

**Extension Events** (NEW):
| Event | Description |
|-------|-------------|
| `RAW_EVENT` | Raw data passthrough |
| `CUSTOM_EVENT` | AEM-specific events (e.g., `aem.content.ready`) |

**HITL Events** (NEW):
| Event | Description |
|-------|-------------|
| `INTERRUPT_REQUESTED` | Human approval needed |
| `INTERRUPT_RESOLVED` | User responded to interrupt |

**Backend** (`StreamingContentService.java`, `StreamingController.java`):
```java
// Basic streaming
@GetMapping(value = "/stream/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamGenerate(@RequestParam String input, @RequestParam String componentType) {
    SseEmitter emitter = streamingService.createEmitter();
    streamingService.streamContentGeneration(input, componentType, emitter, useAi);
    return emitter;
}

// Advanced streaming with AEM DAM integration and full AG-UI events
@GetMapping(value = "/stream/advanced", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamAdvanced(@RequestParam String input, @RequestParam String componentType) {
    SseEmitter emitter = streamingService.createEmitter();
    streamingService.streamWithDamIntegration(input, componentType, emitter, aemIntegrationService);
    return emitter;
}
```

**Frontend** (`streaming-content.ts`):
```typescript
// Listen for ALL 17 event types
const eventTypes = [
  'RUN_STARTED', 'RUN_FINISHED', 'RUN_ERROR', 'STEP_STARTED', 'STEP_FINISHED',
  'TEXT_MESSAGE_START', 'TEXT_MESSAGE_DELTA', 'TEXT_MESSAGE_END',
  'TOOL_CALL_START', 'TOOL_CALL_ARGS', 'TOOL_CALL_END', 'TOOL_CALL_RESULT',
  'STATE_DELTA', 'STATE_SNAPSHOT', 'MESSAGES_SNAPSHOT',
  'RAW_EVENT', 'CUSTOM_EVENT'
];

const eventSource = new EventSource(`${agentUrl}/stream/advanced?input=${prompt}`);
eventTypes.forEach(type => {
  eventSource.addEventListener(type, (e) => this.handleEvent(type, JSON.parse(e.data)));
});
```

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stream/generate` | GET/POST | Basic SSE streaming |
| `/stream/advanced` | GET/POST | Full AG-UI with DAM integration |
| `/stream/raw` | GET | Raw LLM token streaming |
| `/stream/health` | GET | Protocol health with all event types |

**Health Response**:
```json
{
  "status": "ok",
  "protocol": "AG-UI",
  "version": "2.0",
  "aemConnected": true,
  "events": {
    "lifecycle": ["RUN_STARTED", "RUN_FINISHED", "RUN_ERROR", "STEP_STARTED", "STEP_FINISHED"],
    "textMessage": ["TEXT_MESSAGE_START", "TEXT_MESSAGE_DELTA", "TEXT_MESSAGE_END"],
    "toolCall": ["TOOL_CALL_START", "TOOL_CALL_ARGS", "TOOL_CALL_END", "TOOL_CALL_RESULT"],
    "state": ["STATE_DELTA", "STATE_SNAPSHOT", "MESSAGES_SNAPSHOT"],
    "extension": ["RAW_EVENT", "CUSTOM_EVENT"],
    "hitl": ["INTERRUPT_REQUESTED", "INTERRUPT_RESOLVED"]
  }
}
```

**Advanced Workflow Example** (`/stream/advanced`):
```
STEP 1: 🔍 Analyzing request...    → parse_intent
STEP 2: 🖼️ Searching AEM DAM...   → dam_search (TOOL_CALL events)
STEP 3: ✨ Generating content...   → generate_content
STEP 4: 📤 Delivering content...   → stream_output
→ STATE_SNAPSHOT for full recovery
→ CUSTOM_EVENT: aem.content.ready
→ RUN_FINISHED with summary
```

### 22. AI-Driven Component Recommendations (A2UI)

**Feature**: Agent recommends page layout based on user description.

Instead of manually selecting components, user describes what they want and the agent suggests an optimal layout:

```
User: "landing page for summer sale"
Agent: [Navigation → Hero → Teaser x3 → CTA → Footer]
```

**Backend** (`AgentRecommendationService.java`):
- Rule-based detection for page types (landing, product, blog, about, contact)
- LLM integration when available (falls back to rules)
- Component catalog with 15+ components
- Confidence scoring

**Frontend** (`component-recommender.ts`):
- Input field with example prompts
- Visual recommendation with reorderable sections
- Accept & Build Page button

**API Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/recommend` | POST | Get layout recommendation |

---

## Future Enhancements

- [x] Direct AEM integration via Granite APIs
- [x] Brand voice training (implemented via brand-config.json)
- [x] Asset library integration (DAM browser with search, filter, and brand alignment)
- [x] Workflow integration (AEM workflow + collaborative review)
- [x] Integration with AEM Sites Editor (Universal Editor)
- [x] SSE Streaming for real-time content generation (AG-UI)
- [x] AI-driven component recommendations (A2UI)
- [x] **Full AG-UI Protocol (17 event types)** - Steps, Tool Calls, State Management, HITL
- [x] **State synchronization (AG-UI)** - STATE_SNAPSHOT for recovery, STATE_DELTA for updates
- [x] **Tool Call Visualization** - Real-time display of AEM DAM search operations
- [x] **Multi-step Workflow Progress** - Visual step tracking with icons
- [ ] Multi-language support
- [ ] Custom brand config upload
- [ ] A/B testing for content variations
- [ ] Human-in-the-Loop approval interrupts (INTERRUPT_REQUESTED/RESOLVED)

## Troubleshooting

### Rollup Module Error
```bash
rm -rf node_modules package-lock.json && npm install
```

### Embabel Bytecode Error
Use `embabel-agent-api` instead of `embabel-agent-starter`.

### Ollama Connection Failed
Ensure Ollama is running: `ollama serve`
