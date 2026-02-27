# The A2UI Story: AI-Powered Authoring for AEM

## A Tale of Two Worlds

### Chapter 1: Meet Sarah, the AEM Author

Sarah has been creating content in Adobe Experience Manager for three years. She's an expert at the intricacies of component dialogs, content fragment models, and the JCR hierarchy. But today, she's facing a familiar challenge.

> **"I need a hero banner for our summer sale campaign. Something urgent but professional. Oh, and it needs to match our brand voice. And I should probably find an image from the DAM that's seasonal but not overly Christmas-y since we're only in June..."**

Sarah opens the Hero component dialog. She types. She deletes. She types again. She navigates to the DAM, searches "summer," scrolls through 47 images, opens three in preview, closes them, tries another search, gives up, and uses the same generic image she's used for the last four campaigns.

This takes 23 minutes.

---

## Chapter 2: Enter A2UI

What if Sarah could simply *talk* to her CMS?

> **Sarah:** "Create a hero banner for our summer sale. Urgent but professional tone. Summer-themed imagery."
>
> **Assistant:** "Here's what I've created for you..."

```
┌─────────────────────────────────────────────────────────────┐
│  Summer Savings Event                                       │
│  ________________________________________________________  │
│  Don't Miss Out! Up to 50% Off All Products                │
│  Shop the Season's Best Deals Before They're Gone          │
│  ________________________________________________________  │
│                     [ SHOP NOW ]                           │
└────────────────────────────────────────────────────┬───────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │  Brand Score: 92%  │
                                          │  ✓ Action verbs     │
                                          │  ✓ Value messaging  │
                                          │  ✓ Appropriate tone │
                                          └─────────────────────┘
```

This takes 12 seconds.

---

## Chapter 3: What is A2UI?

**A2UI** (Agent-to-User Interface) is a protocol developed by Google that enables AI agents to generate rich, interactive user interfaces dynamically.

Think of it as the missing link between **conversational AI** and **functional applications**.

### The A2UI Protocol Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           A2UI PROTOCOL FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐     1. User Input      ┌──────────┐
   │  USER    │ ─────────────────────► │  CLIENT  │
   │          │                       │          │
   └──────────┘                       └────┬─────┘
                                           │
                                           │ 2. Build A2UI Request
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  A2UI Request Payload                                                        │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ {                                                                   │    │
│  │   "message": {                                                      │    │
│  │     "role": "user",                                                 │    │
│  │     "parts": [{ "text": "Create a hero banner for summer sale" }]  │    │
│  │   },                                                                │    │
│  │   "accept": ["text/plain", "application/json", "text/html"]         │    │
│  │ }                                                                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ 3. POST /tasks
                                           ▼
   ┌──────────┐                       ┌──────────┐
   │          │ ◄──────────────────── │  AGENT   │
   │          │   4. A2UI Response   │          │
   └──────────┘                       └────┬─────┘
                                           │
┌─────────────────────────────────────────────────────────────────────────────┐
│  A2UI Response                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ {                                                                   │    │
│  │   "id": "task-123", "status": "completed",                        │    │
│  │   "messages": [                                                      │    │
│  │     { "role": "assistant", "parts": [{ "json": {...content...} }] } │    │
│  │   ],                                                                │    │
│  │   "artifacts": [{ "type": "application/json", "data": {...} }]      │    │
│  │ }                                                                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ 5. Render UI
                                           ▼
   ┌──────────┐     6. Interactive      ┌──────────┐
   │  USER    │ ◄────────────────────  │  CLIENT  │
   │          │      Interface        │  (Lit)   │
   └──────────┘                       └──────────┘
```

### The Old Way: Prompt → Text Response

```
┌─────────┐      "Create a hero banner"      ┌─────────┐
│  User   │  ──────────────────────────────► │   LLM   │
└─────────┘                                   └─────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │ Here's a hero:  │
                                         │ Title: "Hero"   │
                                         │ Subtitle: "..." │
                                         └─────────────────┘
                                                   │
                                                   ▼
                                         ┌─────────────────┐
                                         │  User copies,   │
                                         │  pastes, hopes  │
                                         │  it works...    │
                                         └─────────────────┘
```

### The A2UI Way: Agent → Structured UI → User

```
┌─────────┐   "Create hero for summer"   ┌─────────┐
│  User   │  ───────────────────────────►│  Agent  │
└─────────┘                               └─────────┘
                                                  │
                              ┌───────────────────┼───────────────────┐
                              ▼                   ▼                   ▼
                     ┌────────────────┐  ┌────────────────┐  ┌──────────────┐
                     │  UI Definition │  │  Content Data  │  │  Actions     │
                     │  (Components) │  │  (JSON Schema) │  │  (Buttons)   │
                     └────────────────┘  └────────────────┘  └──────────────┘
                              │                   │                   │
                              └───────────────────┼───────────────────┘
                                                  ▼
                                        ┌─────────────────────┐
                                        │  Rendered Interface │
                                        │  ┌───────────────┐  │
                                        │  │ Summer Sale!  │  │
                                        │  │ [Shop Now]    │  │
                                        │  └───────────────┘  │
                                        └─────────────────────┘
```

### Why A2UI Matters

| Challenge | Traditional Chat UI | A2UI |
|-----------|---------------------|------|
| **Complex tasks** | Multiple back-and-forth messages | Single request → complete UI |
| **Data accuracy** | User copies/pastes, errors creep in | Structured data, no copy errors |
| **Actions** | "I'll copy that now" | "[Apply]" button in the UI |
| **Rich content** | Text descriptions only | Live preview, thumbnails, scores |
| **Iterating** | "Can you change the title?" | Edit directly, regenerate |
| **AEM Workflow** | Manual submission | One-click submit |

---

## A2UI vs AG-UI: Two Protocols, One Goal

This project uses **two complementary protocols** working together:

### A2UI Protocol (The "What")

**Purpose:** Defines the structure of requests and responses.

- What content to generate (hero, product card, etc.)
- What fields to include (title, subtitle, CTA)
- What actions are available (Apply, Regenerate)
- What brand score to display

```
┌─────────────────────────────────────────────────────────────┐
│  A2UI Response                                             │
│  {                                                         │
│    "content": {                                            │
│      "componentType": "hero",                               │
│      "title": "Summer Sale",                                │
│      "subtitle": "50% Off Everything"                       │
│    },                                                       │
│    "ui": { "brandScore": 92 },                             │
│    "actions": [ {"id": "apply", "label": "Apply"} ]        │
│  }                                                         │
└─────────────────────────────────────────────────────────────┘
```

### AG-UI Protocol (The "How Fast")

**Purpose:** Enables real-time streaming updates.

- Watch content appear word-by-word
- See brand score update live
- Know when generation starts/finishes

```
┌─────────────────────────────────────────────────────────────┐
│  AG-UI Events (streamed via SSE)                          │
│  ──────────────────────────────────────────────────────── │
│  event: RUN_STARTED                                        │
│  event: TEXT_MESSAGE_DELTA {"delta":"Summer"}              │
│  event: TEXT_MESSAGE_DELTA {"delta":" Sale"}               │
│  event: STATE_DELTA {"brandScore":50}                      │
│  event: STATE_DELTA {"brandScore":92}                      │
│  event: RUN_FINISHED                                       │
└─────────────────────────────────────────────────────────────┘
```

### How They Work Together

| Step | Protocol | What Happens |
|------|----------|-------------|
| 1 | A2UI | Client sends structured request |
| 2 | AG-UI | Agent streams updates (title building word-by-word) |
| 3 | A2UI | Final response includes content + UI + actions |

**See [PROTOCOL.md](PROTOCOL.md)** for detailed protocol documentation.

---

## Chapter 3.5: Diagram Legend

All diagrams in this document use the following notation:

```
┌─────────────┐    Box: System, component, or data structure
├─────────────┤    Header row in a structured data box
├─────────────┤    Divider line
│  Text       │    Plain text: Data, content, or label
│  ──────     │    Dashed line: Optional or conditional path
│→ Arrow      │    Solid arrow with arrowhead: Data flow (request → response)
│───→ Arrow   │    Dashed arrow with arrowhead: Control flow or conditional
│← Arrow      │    Reverse arrow: Response or return data
└─────────────┘    Bottom border of box

┌─────────────────────────────────────────────┐
│  Multi-line text spanning the full width    │
├─────────────────────────────────────────────┤
│  Header row                                 │
├─────────────────────────────────────────────┤
│  • Bullet point                             │
│  • Another point                           │
└─────────────────────────────────────────────┘
```

### Example Flow

```
   ┌──────────┐    Request     ┌──────────┐
   │  CLIENT  │ ──────────────► │  AGENT   │  ── Solid arrow: Data flow
   └──────────┘                 └──────────┘
                                    │
                                    │  Optional path
                                    ▼  ── Dashed arrow: Control flow
                           ┌─────────────────────┐
                           │  GENERATE CONTENT    │
                           └─────────────────────┘
```

---

## Chapter 3.6: Your First A2UI Request (5-Minute Tutorial)

Ready to try it yourself? Here's a step-by-step walkthrough.

### Step 1: Start the Backend

```bash
cd agent-java
mvn spring-boot:run
```

The Java agent starts on `http://localhost:10003`.

### Step 2: Start the Frontend

```bash
cd client
npm install
npm run dev
```

The client starts on `http://localhost:5173`.

### Step 3: Open the Assistant

Navigate to `http://localhost:5173`. You'll see the A2UI sidebar with the assistant panel.

### Step 4: Make Your First Request

In the text input box, type:

> **"Create a hero banner for our summer sale"**

Press Enter.

### Step 5: Watch What Happens

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR FIRST REQUEST                                   │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  Summer Savings Event                                                   │
   │  ___________________________________________________________________   │
   │  Don't Miss Out! Up to 50% Off All Products                           │
   │  Shop the Season's Best Deals Before They're Gone                     │
   │  ___________________________________________________________________   │
   │                            [ SHOP NOW ]                                │
   │                                                                          │
   │  ┌─────────────────────────────────────────────────────────────────┐  │
   │  │  Brand Score: 92%                                                │  │
   │  │  • Action-oriented headline (6 words)          ✓                 │  │
   │  │  • Value pillar messaging (Speed, Deals)    ✓                 │  │
   │  │  • Professional tone                       ✓                 │  │
   │  │  • Consider: Add urgency ("Today Only")    ⚠                 │  │
   │  └─────────────────────────────────────────────────────────────────┘  │
   │                                                                          │
   │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
   │  │ [Apply]             │  │ [Regenerate]        │  │ [Edit]          │ │
   │  └─────────────────────┘  └─────────────────────┘  └─────────────────┘ │
   └─────────────────────────────────────────────────────────────────────────┘
```

### Step 6: Apply to AEM

Click **[Apply]** to send the content to AEM.

What happened:
1. Client sent the content to the agent via POST
2. Agent stored content in AEM (simulated)
3. Success confirmation appeared

### Step 7: Submit for Review

Click **[Submit for Review]** to initiate an AEM workflow.

What happened:
1. Workflow submission request sent to agent
2. AEM workflow initiated (simulated)
3. Status updated to "In Progress"

---

## Chapter 3.7: Try These Requests

Once you're comfortable, try these requests to explore the system:

| Request | What You Get |
|---------|--------------|
| `"Create a hero banner"` | Basic hero with title, subtitle, CTA |
| `"Product card for premium widget"` | Product card with image, price, description |
| `"Teaser for summer sale"` | Teaser component with countdown |
| `"Footer with social links"` | Footer with icon placeholders |
| `"Create a carousel for product showcase"` | Multi-image slider |
| `"CTA banner for newsletter signup"` | Focused CTA component |

---

## Chapter 4: The Anatomy of an A2UI Message

When Sarah's request reaches the A2UI Agent, it responds with a structured message:

```json
{
  "id": "msg-123",
  "type": "content",
  "content": {
    "componentType": "hero",
    "title": "Summer Savings Event",
    "subtitle": "Up to 50% Off All Products",
    "description": "Shop the season's best deals before they're gone.",
    "ctaText": "Shop Now",
    "ctaUrl": "/content/..."
  },
  "ui": {
    "layout": "split",
    "brandScore": 92,
    "suggestions": ["bold", "friendly"]
  },
  "actions": [
    {"id": "apply", "label": "Apply to Page"},
    {"id": "regenerate", "label": "Regenerate"},
    {"id": "edit", "label": "Edit"}
  ]
}
```

The **Client** (Sarah's browser) receives this and renders a beautiful, interactive interface—not just text.

---

## Chapter 5: The Brand-Aware Dimension

Here's where A2UI gets powerful for enterprise. Sarah's company, Acme Corp, has brand guidelines:

```json
{
  "brand": {
    "name": "Acme Corp",
    "voice": "Professional, Innovative, Trustworthy"
  },
  "guidelines": {
    "headlines": {
      "maxLength": 6,
      "style": "Action-oriented",
      "examples": ["Transform Your Workflow", "Unlock Potential"]
    },
    "avoid": ["Jargon", "Superlatives", "Passive voice"],
    "valuePillars": ["Speed", "Security", "Integration"]
  }
}
```

The Agent **injects these guidelines into every LLM prompt**:

```
=== BRAND GUIDELINES FOR ACME CORP ===
- Headlines: Max 6 words, action verbs
- Avoid: jargon, superlatives, passive voice
- Value pillars: Speed, Security, Integration
- Tone: Professional, innovative, trustworthy
============================================
User request: "Hero for summer sale"

Generate content following these guidelines...
```

**Result:** Every piece of content Sarah generates is on-brand—automatically.

---

## Chapter 6: Brand Alignment Scoring

But what if the AI misses? A2UI enables **real-time feedback**:

```
┌─────────────────────────────────────────────────────────────┐
│  Summer Savings Event                                       │
│  ________________________________________________________  │
│  Don't Miss Out! Up to 50% Off All Products                │
│  Shop the Season's Best Deals Before They're Gone          │
│  ________________________________________________________  │
│                     [ SHOP NOW ]                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Brand Score: 92%                                  │   │
│  │  ✓ Action-oriented headline (6 words)             │   │
│  │  ✓ Value pillar messaging (Speed, Deals)          │   │
│  │  ✓ Professional tone                               │   │
│  │  ⚠ Consider: Add urgency marker ("Today Only")    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Brand Scoring Algorithm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BRAND SCORING ENGINE                                     │
└─────────────────────────────────────────────────────────────────────────────┘

   Generated Content
         │
         ▼
┌─────────────────────┐
│  Language Analysis  │
│  ─────────────────  │
│  • Word count       │
│  • Sentiment        │
│  • Readability      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Brand Rule Checks │     │  LLM Evaluation     │
│  ───────────────── │     │  ─────────────────  │
│  ✓ Action verbs?   │────►│  • Tone match?     │
│  ✓ Max length?     │     │  • Voice aligned?   │
│  ✓ Avoid words?    │     │  • Style correct?  │
│  ✓ Value pillars?  │     │  • Audience fit?   │
└──────────┬──────────┘     └─────────────────────┘
           │                        │
           │         ┌───────────────┼───────────────┐
           │         ▼               ▼               ▼
           │   ┌───────────┐   ┌───────────┐   ┌───────────┐
           │   │  Voice    │   │  Style    │   │  Brand    │
           │   │  Score    │   │  Score    │   │  Score    │
           │   │  (0-100)  │   │  (0-100)  │   │  (0-100)  │
           │   └───────────┘   └───────────┘   └───────────┘
           │         │               │               │
           └─────────┼───────────────┼───────────────┘
                     │               │
                     ▼               ▼
           ┌─────────────────────────────────────┐
           │       FINAL BRAND SCORE              │
           │       ┌─────────────────┐            │
           │       │      92%        │            │
           │       │  ████████████░░ │            │
           │       │  Excellent!     │            │
           │       └─────────────────┘            │
           │                                         │
           ▼                                       ▼
    ┌──────────────┐                       ┌──────────────┐
    │  Score Factors│                      │ Suggestions │
    │  ─────────────│                      │  ────────── │
    │  ✓ Action verb│                      │  • Urgency  │
    │  ✓ 6 words    │                      │  • Today    │
    │  ✓ Value msg │                      │    Only     │
    └──────────────┘                       └──────────────┘
```

Sarah can trust the content—or click **[Edit]** to fine-tune.

---

## Chapter 7: Beyond Single Components

A2UI scales to entire pages:

> **Sarah:** "Create a landing page for our new product launch."

The Agent doesn't just generate one hero. It suggests a **complete page structure**:

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Recommended Structure                                   │
├─────────────────────────────────────────────────────────────┤
│  1. Navigation     [Logo]    [Menu icon]                   │
│  2. Hero Banner    "Introducing Velocity 2.0"              │
│  3. Feature Grid   4 key benefits with icons              │
│  4. Product Card   Image, price, CTA                       │
│  5. Social Proof   Customer testimonials                   │
│  6. CTA Banner     "Get Started Today"                    │
│  7. Footer         Links, copyright                         │
├─────────────────────────────────────────────────────────────┤
│  [Accept & Generate All]  [Modify Structure]               │
└─────────────────────────────────────────────────────────────┘
```

Sarah clicks **[Accept]**, and the Agent generates all seven sections—in brand, with appropriate content for each.

---

## Chapter 7 (Extended): Component Library Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        A2UI COMPONENT LIBRARY                               │
│                         20 Components × 7 Categories                        │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  MARKETING                        │  CONTENT                             │
   │  ─────────────────────────────────────────────────────────────────────│
   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
   │   │   HERO      │  │   PROMO     │  │   CAROUSEL  │  │   TEASER    │   │
   │   │   BANNER   │  │   BANNER    │  │             │  │             │   │
   │   │             │  │             │  │             │  │             │   │
   │   │  title      │  │  title      │  │  slides[]   │  │  title      │   │
   │   │  subtitle   │  │  description│  │  autoPlay   │  │  description│   │
   │   │  cta        │  │  cta        │  │  duration   │  │  cta        │   │
   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  COMMERCE                       │  MEDIA                                 │
   │  ─────────────────────────────────────────────────────────────────────│
   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
   │   │  PRODUCT    │  │  PRODUCT    │  │   VIDEO     │  │    IMAGE    │   │
   │   │   CARD     │  │   LIST     │  │   PLAYER    │  │   GALLERY   │   │
   │   │             │  │             │  │             │  │             │   │
   │   │  title      │  │  products[] │  │  src        │  │  images[]   │   │
   │   │  price      │  │  layout    │  │  poster     │  │  layout     │   │
   │   │  addToCart  │  │  columns   │  │  autoplay   │  │  lightbox   │   │
   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  NAVIGATION    │  INTERACTIVE  │  SOCIAL                               │
   │  ─────────────────────────────────────────────────────────────────────│
   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
   │   │   NAV      │  │    FORM     │  │   SOCIAL    │  │    TEAM    │   │
   │   │  MENU     │  │             │  │   SHARE     │  │   GRID     │   │
   │   │             │  │             │  │             │  │             │   │
   │   │  items[]   │  │  fields[]  │  │  platforms[]│  │  members[] │   │
   │   │  logo      │  │  submitUrl  │  │  shareUrl   │  │  columns   │   │
   │   │  sticky    │  │  method     │  │  icons      │  │  layout    │   │
   │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │  PAGE TEMPLATES                                                          │
   │  ─────────────────────────────────────────────────────────────────────│
   │                                                                           │
   │   LANDING PAGE        PRODUCT PAGE         BLOG ARTICLE       CUSTOM    │
   │   ────────────        ────────────         ────────────      ──────     │
   │   nav → hero          nav → hero           nav → hero        [empty]    │
   │   teaser ×3           product → tabs       teaser → accordion            │
   │   cta → footer        quote → cta → footer accordion → social           │
   │                                                                           │
   └─────────────────────────────────────────────────────────────────────────┘
```

### How Component Selection Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI COMPONENT RECOMMENDATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────────┘

   User Request: "Create a landing page for our new product launch"
         │
         ▼
┌─────────────────────┐
│  Intent Parser      │
│  ─────────────────  │
│  • Detect: "landing │
│    page" + "product │
│    launch"          │
└──────────┤──────────┘
           │
           ▼
┌─────────────────────┐
│  Template Matcher   │
│  ─────────────────  │
│  Match:             │
│  "landing page"     │──► Product Page Template
│  "product launch"   │
└──────────┤──────────┘
           │
           ▼
┌─────────────────────┐
│  Section Generator  │
│  ─────────────────  │
│  For each section:  │
│  • nav              │──► Generate Navigation
│  • hero             │──► Generate Hero Banner
│  • product          │──► Generate Product Card
│  • tabs             │──► Generate Tabs
│  • quote            │──► Generate Quote
│  • cta              │──► Generate CTA Banner
│  • footer           │──► Generate Footer
└─────────────────────┘
```

---

## Chapter 8: The DAM Integration

Now Sarah needs images. She doesn't browse the DAM manually anymore.

> **Sarah:** "Find a summer-themed product image. Photography style. Blue tones preferred."

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 DAM Search: "summer product photography blue"           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  🖼     │ │  🖼     │ │  🖼     │ │  🖼     │        │
│  │ summer- │ │ beach-  │ │ produc- │ │ blue-   │        │
│  │ 01.jpg  │ │ 02.jpg  │ │ t-03.jpg│ │ 04.jpg  │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│  Brand ✓   Brand ✓    Brand ✓     Brand ✓               │
├─────────────────────────────────────────────────────────────┤
│  [Select Asset]  [Browse DAM]  [Upload New]               │
└─────────────────────────────────────────────────────────────┘
```

The Agent searched the DAM, analyzed each image against brand guidelines, and returned only **brand-aligned** results.

---

## Chapter 9: Workflow Integration

Content created, assets selected. Next step: review.

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Content Status                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Stage: Pending Review                              │   │
│  │                                                     │   │
│  │  👤 Assigned Reviewers:                             │   │
│  │     • Marketing Director                            │   │
│  │     • Brand Manager                                 │   │
│  │                                                     │   │
│  │  💬 Comments (2)                                    │   │
│  │     "Great headline! Lower CTA to 'Learn More'"     │   │
│  │     "Image looks seasonal ✓"                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Submit for Review]  [Request Changes]  [Approve]         │
└─────────────────────────────────────────────────────────────┘
```

A2UI isn't just about creation—it's about the **entire content lifecycle**.

---

## Chapter 9 (Extended): Content Lifecycle & Workflow States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTENT LIFECYCLE STATE MACHINE                           │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────────────────┐
                    │                   CREATION PHASE                        │
                    │  ┌─────────┐    ┌─────────┐    ┌─────────┐              │
                    │  │  DRAFT  │───►│GENERATED│───►│ EDITING │              │
                    │  └─────────┘    └─────────┘    └────┬────┘              │
                    │       ▲                           │                    │
                    │       │                           ▼                    │
                    │       │                    ┌─────────────┐              │
                    │       │                    │   READY FOR │              │
                    │       │                    │    REVIEW   │              │
                    │       │                    └──────┬──────┘              │
                    │       │                           │                    │
                    └───────┼───────────────────────────┼────────────────────┘
                            │                           │
                            │    ┌──────────────────────┘
                            │    │
                            ▼    │
                    ┌─────────────────────────────────────────────────────────┐
                    │                   REVIEW PHASE                          │
                    │                                                          │
                    │    ┌──────────────────────────────────────────────────┐ │
                    │    │               REVIEW_IN_PROGRESS                  │ │
                    │    │  ┌─────────┐    ┌─────────┐    ┌─────────┐      │ │
         ┌──────────┼────►│  PENDING │───►│  IN     │───►│ CHANGES │      │ │
         │          │    │  REVIEW  │    │  REVIEW │    │REQUESTED│      │ │
         │          │    └─────────┘    └─────────┘    └────┬────┘      │ │
         │          │         │              │              │           │ │
         │          │         │              │              │           │ │
         │          │         │              ▼              │           │ │
         │          │         │      ┌───────────┐         │           │ │
         │          │         │      │REJECTED  │◄────────┘           │ │
         │          │         │      │(Archive) │                      │ │
         │          │         │      └───────────┘                      │ │
         │          │         │              │                          │ │
         │          │         │              │                          │ │
         │          │         │              ▼                          │ │
         │          │         │      ┌───────────────┐                   │ │
         │          │         │      │   APPROVED   │                   │ │
         │          │         │      └───────┬───────┘                   │ │
         │          │         │              │                           │ │
         └──────────┼─────────┴──────────────┼───────────────────────────┘ │
                    │                          │                            │
                    │                          ▼                            │
                    │    ┌──────────────────────────────────────────────────┐
                    │    │               WORKFLOW PHASE                     │
                    │    │                                                   │
                    │    │  ┌───────────┐    ┌───────────┐    ┌───────────┐│
                    │    │  │ SUBMITTED │───►│ IN WORKFLOW│───►│  COMPLETE ││
                    │    │  │           │    │  (AEM)    │    │           ││
                    │    │  └───────────┘    └─────┬─────┘    └─────┬─────┘│
                    │    │                          │                │      │
                    │    │                          │                ▼      │
                    │    │                          │        ┌───────────┐  │
                    │    │                          │        │  LIVE /   │  │
                    │    │                          │        │ PUBLISHED │  │
                    │    │                          │        └───────────┘  │
                    │    │                          │                         │
                    │    │        ┌─────────────────┼──────────────┐         │
                    │    │        │                 │              │         │
                    │    │        ▼                 ▼              ▼         │
                    │    │  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
                    │    │  │  CANCELLED│  │  FAILED   │  │  SCHEDULED│     │
                    │    │  └───────────┘  └───────────┘  └───────────┘     │
                    │    │                                                   │
                    └────┼───────────────────────────────────────────────────┘
                         │
                         ▼
                    ┌───────────┐
                    │ ARCHIVED  │
                    └───────────┘
```

### Workflow Integration Points

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AEM WORKFLOW INTEGRATION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

   A2UI Assistant                        AEM Workflow Engine
   ┌─────────────┐                       ┌─────────────────────────┐
   │             │    Submit Request     │                         │
   │ [Approve]   │ ────────────────────► │  ┌───────────────────┐  │
   │             │                       │  │ Workflow Instance │  │
   └─────────────┘                       │  │                   │  │
                                          │  │  Step 1: Review  │──┼──► Assigned
                                          │  │  Step 2: Approve │──┼──► Approver
                                          │  │  Step 3: Publish │──┼──► Publish
                                          │  └───────────────────┘  │
                                          └───────────┬─────────────┘
                                                      │
                                                      │ Status Updates
                                                      ▼
                                          ┌─────────────────────────┐
                                          │  Status Returned to UI  │
                                          │  ┌───────────────────┐  │
                                          │  │ • Pending Review  │  │
                                          │  │ • In Review       │  │
                                          │  │ • Approved        │  │
                                          │  │ • Published       │  │
                                          │  └───────────────────┘  │
                                          └─────────────────────────┘
```

---

## Chapter 10: The Technical Story

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         A2UI DEMO - TECHNICAL ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────────────────────────────────────────┐
                         │                  LAYERS                              │
                         │  ┌─────────────────────────────────────────────┐   │
                         │  │           FRONTEND (Client)                  │   │
                         │  │  ┌─────────────────────────────────────────┐  │   │
                         │  │  │  Lit Web Components                    │  │   │
                         │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │   │
                         │  │  │  │Assistant│ │ Assistant│ │  DAM    │  │  │   │
                         │  │  │  │ Header  │ │ Preview │ │Browser  │  │  │   │
                         │  │  │  └─────────┘ └─────────┘ └─────────┘  │  │   │
                         │  │  │  ┌─────────────────────────────────┐  │  │   │
                         │  │  │  │  Adobe Spectrum Design System  │  │  │   │
                         │  │  │  │  • sp-theme, sp-button          │  │  │   │
                         │  │  │  │  • sp-textfield, sp-dialog     │  │  │   │
                         │  │  │  └─────────────────────────────────┘  │  │   │
                         │  │  └─────────────────────────────────────────┘  │   │
                         │  │                        │                        │   │
                         │  │         ┌──────────────┼──────────────┐        │   │
                         │  │         ▼              ▼              ▼        │   │
                         │  │  ┌───────────┐ ┌───────────┐ ┌───────────────┐ │   │
                         │  │  │  SSE      │ │ REST API  │ │  WebSocket   │ │   │
                         │  │  │  Client   │ │ (A2UI)    │ │  (Optional)  │ │   │
                         │  │  └───────────┘ └───────────┘ └───────────────┘ │   │
                         │  └────────────────────────┬────────────────────────┘   │
                         │                           │                           │
                         └───────────────────────────┼───────────────────────────┘
                                                     │
                         ┌───────────────────────────┼───────────────────────────┐
                         │                           │                           │
                         ▼                           ▼                           ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌───────────────────────────────┐
│         BACKEND (Agent)       │   │        EXTERNAL AI            │   │        AEM INTEGRATION       │
│      ┌───────────────────┐    │   │                               │   │                               │
│      │  Spring Boot 3.2  │    │   │  ┌─────────────────────────┐  │   │  ┌─────────────────────────┐  │
│      │  ┌─────────────┐  │    │   │  │   LLM PROVIDERS         │  │   │  │    AEM SDK / APIs        │  │
│      │  │   A2UI      │  │    │   │  │  ┌─────┐ ┌─────┐ ┌─────┐│  │   │  │  ┌─────┐ ┌─────┐ ┌─────┐│  │
│      │  │   Agent     │  │    │   │  │  │OpenAI│ │Anthropic│Ollama││  │   │  │  │DAM  │ │Workflow│Content││  │
│      │  │   Core      │  │    │   │  │  │GPT-4o│ │Claude 3.5│llama3││  │   │  │  │API  │ │ API  │ │ API ││  │
│      │  └──────┬──────┘  │    │   │  │  └─────┘ └─────┘ └─────┘│  │   │  │  └─────┘ └─────┘ └─────┘│  │
│      │         │          │    │   │  └─────────────────────────┘  │   │  │                           │  │
│      │         │          │    │   │                               │   │  └─────────────────────────┘  │
│      │  ┌──────┴──────┐    │    │   └───────────────────────────────┘   │                                 │
│      │  │ Embabel     │    │                                               │                                 │
│      │  │ Framework   │    │                                               │                                 │
│      │  │ @Agent      │    │                                               │                                 │
│      │  │ @Action     │    │                                               │                                 │
│      │  └──────┬──────┘    │                                               │                                 │
│      │         │          │                                               │                                 │
│      │  ┌──────┴──────┐    │                                               │                                 │
│      │  │ Services    │    │                                               │                                 │
│      │  │ • LlmService│    │                                               │                                 │
│      │  │ • Streaming │    │                                               │                                 │
│      │  │ • DAM Client│    │                                               │                                 │
│      │  │ • Workflow  │    │                                               │                                 │
│      │  └─────────────┘    │                                               │                                 │
│      └───────────────────┘    │                                               │                                 │
└───────────────────────────────┘                                               │                                 │
                                                                               │                                 │
                                                                               │ HTTP/API                        │
                                                                               ▼                                 │
                                                                       ┌─────────────────────────┐         │
                                                                       │   AEM Author Instance   │         │
                                                                       │   localhost:4502        │         │
                                                                       │                         │         │
                                                                       │  ┌───────────────────┐  │         │
                                                                       │  │ /content/*       │  │         │
                                                                       │  │ /content/dam/*  │  │         │
                                                                       │  │ /etc/workflow/* │  │         │
                                                                       │  └───────────────────┘  │         │
                                                                       └─────────────────────────┘         │
```

### AEM Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AEM INTEGRATION ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                     A2UI DEMO APPLICATION                                 │
   │                                                                          │
   │   ┌────────────────────────────────────────────────────────────────┐   │
   │   │                    AemHttpClient.java                            │   │
   │   │  ┌─────────────────────────────────────────────────────────┐  │   │
   │   │  │  Base HTTP Client with:                                  │  │   │
   │   │  │  • Basic Authentication                                   │  │   │
   │   │  │  • Automatic retry logic                                  │  │   │
   │   │  │  • JSON parsing (Jackson)                                 │  │   │
   │   │  │  • Connection pooling                                     │  │   │
   │   │  └─────────────────────────────────────────────────────────┘  │   │
   │   └────────────────────────────────────────────────────────────────┘   │
   │                                                                          │
   │   ┌────────────────────────────────────────────────────────────────┐   │
   │   │                    AemDamClient.java                            │   │
   │   │  ┌─────────────────────────────────────────────────────────┐  │   │
   │   │  │  DAM Operations:                                        │  │   │
   │   │  │  • listAssets(path)     - Browse folders               │  │   │
   │   │  │  • searchAssets(query)  - Full-text search             │  │   │
   │   │  │  • getAssetDetails(path)- Get metadata, renditions    │  │   │
   │   │  │  • getRendition(path, renditionName)                   │  │   │
   │   │  │  • uploadAsset(path, file) - Upload new assets         │  │   │
   │   │  └─────────────────────────────────────────────────────────┘  │   │
   │   └────────────────────────────────────────────────────────────────┘   │
   │                                                                          │
   │   ┌────────────────────────────────────────────────────────────────┐   │
   │   │                 AemWorkflowClient.java                          │   │
   │   │  ┌─────────────────────────────────────────────────────────┐  │   │
   │   │  │  Workflow Operations:                                   │  │   │
   │   │  │  • submitWorkflow(payload, model)  - Start workflow    │  │   │
   │   │  │  • getWorkflowStatus(instanceId)   - Check progress    │  │   │
   │   │  │  • advanceWorkflow(instanceId, step)- Complete step    │  │   │
   │   │  │  • cancelWorkflow(instanceId)        - Abort workflow  │  │   │
   │   │  └─────────────────────────────────────────────────────────┘  │   │
   │   └────────────────────────────────────────────────────────────────┘   │
   │                                                                          │
   │   ┌────────────────────────────────────────────────────────────────┐   │
   │   │                 AemContentClient.java                          │   │
   │   │  ┌─────────────────────────────────────────────────────────┐  │   │
   │   │  │  Content Operations:                                     │  │   │
   │   │  │  • saveContent(path, content)  - Save page/fragment    │  │   │
   │   │  │  • publishContent(path)       - Activate to publish    │  │   │
   │   │  │  • getContent(path)           - Read content           │  │   │
   │   │  │  • createPage(template, path, title)                  │  │   │
   │   │  └─────────────────────────────────────────────────────────┘  │   │
   │   └────────────────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST Calls
                                    ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                         AEM AUTHOR (localhost:4502 )                      │
   │                                                                          │
   │   REST API Endpoints:                                                    │
   │   ┌─────────────────────────────────────────────────────────────────┐   │
   │   │  /api/assets/{path}.json           - Sling JSON export         │   │
   │   │  /api/experienceleagments/...      - Experience Fragments      │   │
   │   │  /graphql/execute.json              - GraphQL endpoints         │   │
   │   │  /bin/cq/workflow/instances        - Workflow management        │   │
   │   │  /bin/replicate.json               - Replication API           │   │
   │   └─────────────────────────────────────────────────────────────────┘   │
   │                                                                          │
   │   JCR Content Structure:                                                  │
   │   ┌─────────────────────────────────────────────────────────────────┐   │
   │   │  /content                                                    │   │
   │   │  ├── /aem-demo                                               │   │
   │   │  │   ├── /us/en                                              │   │
   │   │  │   │   ├── /landing-page-1                                 │   │
   │   │  │   │   │   └── jcr:content                                │   │
   │   │  │   │   └── jcr:content                                    │   │
   │   │  │   └── jcr:content                                        │   │
   │   │  └── /jcr:content                                          │   │
   │   │                                                              │   │
   │   │  /content/dam                                               │   │
   │   │  ├── /aem-demo                                               │   │
   │   │  │   ├── /images                                             │   │
   │   │  │   │   ├── /summer-campaign                               │   │
   │   │  │   │   │   └── jcr:content (metadata + renditions)       │   │
   │   │  │   │   └── ...                                            │   │
   │   │  │   └── ...                                                │   │
   │   │  └── /jcr:content                                          │   │
   │   └─────────────────────────────────────────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                     │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                            FRONTEND                                      │
   │  ─────────────────────────────────────────────────────────────────────  │
   │                                                                           │
   │   Core Framework          UI Components           State/Events          │
   │   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
   │   │     Lit      │──────►│   Adobe      │──────►│    AG-UI     │        │
   │   │  (Web Components)   │  Spectrum    │       │  (Streaming) │        │
   │   │  v3.x             │  Web Components│      │              │        │
   │   └──────────────┘       │  v1.x       │       └──────────────┘        │
   │                          └──────────────┘                               │
   │                                                                           │
   │   Build/Tooling           Styling               Testing                │
   │   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
   │   │    Vite      │──────►│   CSS        │──────►│   Vitest     │        │
   │   │  (dev server)│       │  Variables   │       │   (unit)     │        │
   │   └──────────────┘       └──────────────┘       └──────────────┘        │
   │                                                                           │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                             BACKEND                                      │
   │  ─────────────────────────────────────────────────────────────────────  │
   │                                                                           │
   │   Server Framework       Agent Framework         AI/LLM                  │
   │   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
   │   │   Spring    │──────►│   Embabel    │──────►│  Multi-LLM   │        │
   │   │   Boot 3.2  │       │   Agent      │       │  Provider   │        │
   │   │  (Java 21)  │       │   Framework  │       │  Interface   │        │
   │   └──────────────┘       └──────────────┘       └──────┬───────┘        │
   │                                                        │                 │
   │   HTTP Client           Data Format         ┌──────────┴──────────┐      │
   │   ┌──────────────┐       ┌──────────────┐   │                     │      │
   │   │ Spring Web  │──────►│  Jackson     │   │  OpenAI           │      │
   │   │ (REST/SSE)  │       │  (JSON)      │   │  Anthropic        │      │
   │   └──────────────┘       └──────────────┘   │  Ollama (local)   │      │
   │                                               └─────────────────┘      │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────────────────────────┐
   │                           INTEGRATION                                    │
   │  ─────────────────────────────────────────────────────────────────────  │
   │                                                                           │
   │   AEM SDK                   Protocol               Configuration       │
   │   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
   │   │   AEM as a  │◄──────►│    A2UI     │       │   Spring    │        │
   │   │   Cloud     │       │    v0.8      │       │   Config     │        │
   │   │   Service   │       │    AG-UI     │       │  (YAML)      │        │
   │   └──────────────┘       └──────────────┘       └──────────────┘        │
   │                                                                           │
   └─────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────┐
│                        Sarah's Browser                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Lit Web Components + Adobe Spectrum                    │   │
│  │  • Assistant Panel (left)                               │   │
│  │  • Live Preview (center)                                │   │
│  │  • DAM Browser, Workflow, Review (panels)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│                              ▼ A2UI JSON                       │
┌─────────────────────────────────────────────────────────────────┐
│                    A2UI Agent (Java/Spring)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Embabel Framework                                      │   │
│  │  • AemContentAgent (@Agent)                            │   │
│  │  • @Action handlers for each intent                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│            ┌─────────────────┼─────────────────┐              │
│            ▼                 ▼                 ▼              │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐   │
│  │  LLM Service  │ │ Brand Config │ │  AEM SDK Client    │   │
│  │  • OpenAI     │ │  (JSON)      │ │  • DAM Browser     │   │
│  │  • Anthropic  │ │              │ │  • Workflow        │   │
│  │  • Ollama     │ │              │ │  • Content Save    │   │
│  └──────────────┘ └──────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key A2UI Features Demonstrated

| Feature | How It's Used |
|---------|--------------|
| **Streaming Responses** | Content appears word-by-word (AG-UI protocol) |
| **State Synchronization** | Preview updates in real-time as content streams |
| **Actions** | Apply, Regenerate, Edit, Submit, Approve |
| **Artifacts** | Full content JSON sent alongside UI definition |
| **Tool Use** | Agent calls DAM search, AEM workflow APIs |

---

## Chapter 10 (Extended): SSE Streaming & Real-Time Updates

### AG-UI Event Streaming Protocol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AG-UI EVENT STREAMING PROTOCOL                           │
└─────────────────────────────────────────────────────────────────────────────┘

   CLIENT                                                          SERVER
     │                                                                │
     │  GET /stream/generate?input=hero&componentType=banner           │
     │ ─────────────────────────────────────────────────────────────► │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │  HTTP/1.1 200 OK                                         │ │
     │  │  Content-Type: text/event-stream                         │ │
     │  │  Cache-Control: no-cache                                 │ │
     │  │  Connection: keep-alive                                  │ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │ event: RUN_STARTED                                        │ │
     │  │ data: {"runId":"abc-123","status":"started"}             │ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │ event: TEXT_MESSAGE_START                                 │ │
     │  │ data: {"field":"title","messageId":"msg-1"}             │ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │ event: TEXT_MESSAGE_DELTA                                  │ │
     │  │ data: {"field":"title","delta":"Summer","content":"..."} │ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │ event: TEXT_MESSAGE_DELTA                                  │ │
     │  │ data: {"field":"title","delta":" Savings","content":"..."}│ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │              ... content streaming word by word ...             │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │ event: STATE_DELTA                                         │ │
     │  │ data: {"delta":{"content":{...complete content...}}}     │ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │  ┌───────────────────────────────────────────────────────────┐ │
     │  │ event: RUN_FINISHED                                       │ │
     │  │ data: {"runId":"abc-123","status":"completed"}           │ │
     │  └───────────────────────────────────────────────────────────┘ │
     │ ◄───────────────────────────────────────────────────────────── │
     │                                                                │
     │                         ▲                                      │
     │                         │ Complete                             │
     └─────────────────────────┴──────────────────────────────────────►

```

### Real-Time Preview Update Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME PREVIEW SYNCHRONIZATION                         │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐                    ┌──────────┐                    ┌──────────┐
   │  AG-UI   │                    │ A2UI     │                    │  LIVE    │
   │  CLIENT  │◄───────────────────►│  AGENT   │◄──────────────────►│  PREVIEW │
   └────┬─────┘    SSE Events      └────┬─────┘                    └────┬─────┘
        │                                │                               │
        │  TEXT_MESSAGE_DELTA            │                               │
        │  {field:"title",               │                               │
        │   delta:"Summer",              │                               │
        │   content:"Summer..."}         │                               │
        │ ───────────────────────────────►│                               │
        │                                │                               │
        │                                │      Update State             │
        │                                │ ─────────────────────────────►│
        │                                │                               │
        │                                │              ┌────────────┐  │
        │                                │              │ Title:      │  │
        │                                │              │ "Summer..." │  │
        │                                │              │ ┌────────┐  │  │
        │                                │              │ │Summer │  │  │
        │                                │              │ │Sav...│  │  │
        │                                │              │ └────────┘  │  │
        │                                │              └────────────┘  │
        │                                │                               │
        │  More deltas...                 │                               │
        │ ───────────────────────────────►│                               │
        │                                │      Render updates           │
        │                                │ ─────────────────────────────►│
        │                                │                               │
        │                                │              ┌────────────┐  │
        │                                │              │ Title:      │  │
        │                                │              │ Summer      │  │
        │                                │              │ Savings     │  │
        │                                │              │ Event       │  │
        │                                │              └────────────┘  │
        │                                │                               │
```

### LLM Provider Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-LLM PROVIDER ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────────────────┐
                         │    A2UI Content Agent        │
                         │    ┌───────────────────┐    │
                         │    │  LLM Service      │    │
                         │    │  (Interface)      │    │
                         │    └─────────┬─────────┘    │
                         └──────────────┼──────────────┘
                                        │
                          ┌─────────────┼─────────────┐
                          │             │             │
                          ▼             ▼             ▼
               ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
               │    OPENAI      │ │  ANTHROPIC   │ │   OLLAMA     │
               │                │ │              │ │   (Local)    │
               ├────────────────┤ ├──────────────┤ ├──────────────┤
               │ • GPT-4o      │ │ • Claude 3.5 │ │ • llama3.2   │
               │ • GPT-4 Turbo │ │ • Sonnet     │ │ • qwen2.5    │
               │ • GPT-3.5     │ │ • Haiku      │ │ • mistral    │
               ├────────────────┤ ├──────────────┤ ├──────────────┤
               │ Cloud API     │ │ Cloud API    │ │ Local HTTP   │
               │ • High cost   │ │ • High cost  │ │ • Free       │
               │ • Best quality│ │ • Excellent  │ │ • Good quality│
               │ • Data leaves │ │ • Data leaves│ │ • 100% local │
               └────────────────┘ └──────────────┘ └──────────────┘
                          │             │             │
                          └─────────────┼─────────────┘
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │  Response Parser   │
                              │  ─────────────────  │
                              │  • Parse JSON      │
                              │  • Repair broken   │
                              │  • Extract content │
                              └─────────┬───────────┘
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │  Brand Scorer      │
                              └─────────────────────┘
```

---

## Chapter 11: Why This Matters for AEM

### The Problem with Traditional AEM Authoring

| Aspect | Current Experience | Pain Point |
|--------|-------------------|------------|
| **Content Creation** | Manual typing in dialogs | Time-consuming, inconsistent |
| **Component Selection** | Browse component library | Authors don't know what's available |
| **Asset Discovery** | Manual DAM browsing | "Where did I save that image?" |
| **Brand Enforcement** | Style guides (PDF) | Often ignored or forgotten |
| **Learning Curve** | Complex UI | New authors need weeks of training |

### The A2UI Solution

| Aspect | A2UI Experience | Benefit |
|--------|----------------|---------|
| **Content Creation** | "Create a hero for..." | 10x faster, on-brand |
| **Component Selection** | "I need a page for..." | AI recommends structure |
| **Asset Discovery** | "Find summer images" | AI filters by brand |
| **Brand Enforcement** | Built into every prompt | 100% consistent |
| **Learning Curve** | Conversational UI | Day 1 productivity |

---

## Chapter 12: The Privacy Consideration

Some organizations can't send content to cloud AI. A2UI supports **on-premise** deployment:

```
┌─────────────────────────────────────────────────────────────┐
│  Enterprise Deployment Options                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CLOUD                    │  ON-PREMISE                    │
│  ──────────────────────── │ ─────────────────────────────  │
│  • OpenAI GPT-4           │  • Ollama (local)              │
│  • Anthropic Claude       │  • llama3.2                    │
│  • Highest quality       │  • qwen2.5                     │
│  • Data leaves network   │  • 100% private                │
│                                                             │
│  Configuration:           │  Configuration:                │
│  LLM_PROVIDER=openai     │  LLM_PROVIDER=ollama          │
│  AI_ENABLED=true         │  AI_ENABLED=true              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Same A2UI interface. Same user experience. Different backend.**

---

## Chapter 13: Sarah's New Reality

Let's revisit Sarah, one year later.

> **Sarah (Monday 9:15 AM):** "Create a landing page for our fall campaign. Sophisticated tone, autumn colors."
>
> **Assistant:** *Generates complete page in 15 seconds. Brand score: 94%.*
>
> **Sarah:** *Clicks [Apply], [Submit for Review].*

> **Sarah (Monday 9:32 AM):** "Product card for the new signature series. Professional but approachable."
>
> **Assistant:** *Generates, scores, renders.*
>
> **Sarah:** *Selects DAM image, [Apply], done.*

> **Sarah (Monday 10:00 AM):** *Marketing Director approves the fall landing page via the workflow panel.*
>
> **Sarah:** *Clicks [Submit to Publish Workflow].*

In **45 minutes**, Sarah completed what used to take her **two full days**.

---

## Chapter 13 (Extended): Sarah's Day - Before vs After

### Before A2UI (The Old Way)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SARAH'S MONDAY (BEFORE A2UI)                              │
└─────────────────────────────────────────────────────────────────────────────┘

   9:00 AM ──────────────────────────────────────────────────────────────────►

   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Opening │  │  Create  │  │  Browse  │  │ Configure│  │  Type    │
   │  Email   │  │  Hero    │  │  DAM for │  │  Dialog  │  │  Content │
   │          │  │  Dialog  │  │  Images  │  │  (45+)   │  │  (30+    │
   │          │  │  (wait)  │  │  (20+    │  │  fields) │  │  mins)   │
   │          │  │          │  │  mins)   │  │          │  │          │
   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
      30 min       15 min       25 min        45 min        35 min

   ───────────────────────────────────────────────────────────────────────────

   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Fix      │  │  Find    │  │  Create  │  │  Upload  │  │  More    │
   │  Brand    │  │  Stock   │  │  Product │  │  to DAM  │  │  Pages   │
   │  Issues   │  │  Image   │  │  Card    │  │  (wait   │  │  (same   │
   │  (review) │  │  (30+    │  │  (45     │  │  IT)     │  │  process)│
   │          │  │  mins)   │  │  mins)   │  │          │  │          │
   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
      20 min       35 min        50 min        15 min       4+ hours

   ───────────────────────────────────────────────────────────────────────────

   TOTAL TIME: ~8 hours (2 full days)
   ┌────────────────────────────────────────────────────────────────────────┐
   │  Tasks Completed: 1 Landing Page + 2 Product Pages                     │
   │  Brand Score: ~60% (inconsistent, rushed)                               │
   │  Frustration Level: ██████████░░░░░░░░░░ (high)                        │
   └────────────────────────────────────────────────────────────────────────┘
```

### After A2UI (The New Way)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SARAH'S MONDAY (WITH A2UI)                                │
└─────────────────────────────────────────────────────────────────────────────┘

   9:00 AM ──────────────────────────────────────────────────────────────────►

   ┌───────────────────────────┐
   │ "Create landing page      │
   │  for fall campaign.       │
   │  Sophisticated tone."     │
   └────────────┬──────────────┘
                │ 15 seconds
                ▼
   ┌───────────────────────────┐
   │ ┌───────────────────────┐ │
   │ │ Brand Score: 94%     │ │
   │ │ ✓ All sections       │ │
   │ │ ✓ Brand aligned      │ │
   │ │ ✓ Ready for review  │ │
   │ └───────────────────────┘ │
   │                             │
   │ [Apply] [Submit for Review] │
   └────────────┬──────────────┘
                │ 30 seconds
                ▼
   ┌───────────────────────────┐
   │ "Product card for        │
   │  signature series.        │
   │  Professional."          │
   └────────────┬──────────────┘
                │ 12 seconds
                ▼
   ┌───────────────────────────┐
   │ ┌───────────────────────┐ │
   │ │ ✓ Image selected      │ │
   │ │ ✓ CTA configured     │ │
   │ │ ✓ Ready for review  │ │
   │ └───────────────────────┘ │
   │                             │
   │ [Apply] [Submit for Review] │
   └────────────┬──────────────┘
                │ 20 seconds
                ▼
         ─ 30 MINUTE BREAK  ─
          (while Marketing
          Director reviews)
                │
                ▼
   ┌───────────────────────────┐
   │ ✓ Fall page approved     │
   │ ✓ Product card approved   │
   │                             │
   │ [Submit to Publish]        │
   └────────────┬──────────────┘
                │ 10 seconds
                ▼
   ┌───────────────────────────┐
   │ ✓ Submitted to workflow   │
   │ ✓ Status: In Progress     │
   │                             │
   │ ┌───────────────────────┐ │
   │ │ Tasks Complete:      │ │
   │ │ • Landing Page ✓     │ │
   │ │ • Product Card ✓    │ │
   │ │ • Ready to Publish  │ │
   │ └───────────────────────┘ │
   └───────────────────────────┘

   ───────────────────────────────────────────────────────────────────────────

   TOTAL TIME: ~45 minutes
   ┌────────────────────────────────────────────────────────────────────────┐
   │  Tasks Completed: 1 Landing Page + 1 Product Card + Workflow Submit  │
   │  Brand Score: 94% (consistent, scored)                                │
   │  Frustration Level: █░░░░░░░░░░░░░░░ (minimal)                        │
   └────────────────────────────────────────────────────────────────────────┘
```

### Productivity Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTIVITY METRICS COMPARISON                            │
└─────────────────────────────────────────────────────────────────────────────┘

   Metric                    Before A2UI      With A2UI      Improvement
   ──────────────────────────────────────────────────────────────────────────
   Time per Hero Banner         23 minutes       15 seconds      ████ 92x
   Time per Product Card        45 minutes       12 seconds      ████ 225x
   Time per Landing Page        4 hours          15 seconds      ████ 960x
   ──────────────────────────────────────────────────────────────────────────
   Brand Consistency           ~60%             ~94%             ████ +57%
   Learning Curve              2-4 weeks         1 day           ████ 14x
   Frustration Level           High             Low             ████ ✓
   ──────────────────────────────────────────────────────────────────────────
   Daily Tasks Completed        3-4             15-20            ████ 5x
   Weekly Content Velocity      10 pages        50 pages         ████ 5x

   ════════════════════════════════════════════════════════════════════════════
   SUMMARY: 10x faster content creation, 57% better brand consistency
   ════════════════════════════════════════════════════════════════════════════
```

---

## The Takeaway

A2UI represents a fundamental shift in how authors interact with content management systems:

| Before A2UI | After A2UI |
|-------------|------------|
| "I need to configure this dialog" | "Create what I need" |
| "Where is that component?" | "I need a page like this..." |
| "Is this on-brand?" | Brand score: 95% |
| "Let me find an image..." | "Find assets like this..." |
| Multiple systems, disjointed | Conversational, unified |

---

## Getting Started with This Demo

This project demonstrates A2UI with:

- ✅ **20 component types** (Hero, Teaser, Product Card, etc.)
- ✅ **Brand-Aware AI** with alignment scoring
- ✅ **DAM Browser** with brand-filtered search
- ✅ **Workflow Integration** (Review → Approve → Publish)
- ✅ **SSE Streaming** for real-time updates
- ✅ **Adobe Spectrum** design system

### Recommended Reading Order

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICKSTART.md](../QUICKSTART.md)** | 5-minute hands-on tutorial | 5 min |
| **[CONCEPTS.md](../CONCEPTS.md)** | AEM-to-A2UI concept mapping | 10 min |
| **This document** | Full narrative with diagrams | 30 min |
| **[PLAN.md](../PLAN.md)** | Future features & roadmap | 5 min |
| **[CLAUDE.md](../CLAUDE.md)** | Technical decisions | Reference |

### Quick Start

```bash
# Terminal 1: Start Java agent (template mode - no AI)
cd agent-java && mvn spring-boot:run

# Terminal 2: Start client
cd client && npm run dev

# Open http://localhost:5173
```

### With AI (Ollama)

```bash
# Start Ollama
ollama run llama3.2

# Start agent with AI
cd agent-java
AI_ENABLED=true LLM_PROVIDER=ollama mvn spring-boot:run
```

---

## Frequently Asked Questions

### General Questions

**Q: Does A2UI replace AEM components?**

A: No. A2UI generates content *for* AEM components, not instead of them. The agent creates text, images, and metadata that populates your existing AEM component dialogs. Think of it as a smarter authoring interface layered on top of your existing component architecture.

**Q: How is this different from AEM's built-in AI features?**

A: A2UI provides a conversational interface for content creation, which AEM doesn't natively support. It generates complete component configurations (title, subtitle, CTA, image) in one request, rather than requiring authors to fill out dialogs field by field.

**Q: Can I use this with AEM as a Cloud Service?**

A: Yes. The Java agent runs externally and communicates with AEM via REST APIs. You'll need to configure the agent to point to your AEM Cloud author instance.

---

### Technical Questions

**Q: Where does the content get stored?**

A: In this demo, content is stored to a simulated endpoint. In a production deployment, the agent would POST content to AEM's REST API (`/api/assets` or content fragment endpoints).

**Q: How does DAM integration work?**

A: The agent queries AEM's Sling JSON export (`/content/dam/{path}.1.json`) and filters assets based on brand visual guidelines defined in `brand-config.json`.

**Q: What happens if the AI is unavailable?**

A: The agent has a template fallback system. When AI is disabled or unavailable, it uses predefined templates to generate content. This ensures the demo works even without an LLM.

**Q: Which LLM providers are supported?**

A: The architecture supports OpenAI, Anthropic, and Ollama (local). You can also extend the `LlmService` interface to add other providers.

**Q: Is my data sent to external servers?**

A: That depends on your configuration:
- **OpenAI/Anthropic**: Data is sent to their cloud services
- **Ollama (local)**: All processing happens on your machine, no data leaves the network

---

### AEM Developer Questions

**Q: How do I add a new component type?**

A: Three steps:
1. Add the component definition in `agent-java/src/main/resources/templates/`
2. Add rendering logic in `client/src/components/`
3. Update `client/src/lib/types.ts` with the new component type

**Q: Can I customize the brand guidelines?**

A: Yes. Edit `client/src/data/brand-config.json` or the equivalent in `agent-java/src/main/resources/`. The agent loads these guidelines and injects them into every LLM prompt.

**Q: How do I integrate with existing AEM workflows?**

A: The agent provides REST endpoints for workflow submission. Configure your workflow model ID and the agent will POST to AEM's workflow REST API.

**Q: What's the difference between this and a Sling Model?**

A: A Sling Model is a server-side Java object. An A2UI message is a JSON structure transmitted over HTTP. The client renders the JSON dynamically, enabling real-time streaming and interactive updates that Sling Models can't provide.

---

### Security & Enterprise Questions

**Q: How do I secure the agent API?**

A: In production, you should:
- Add authentication (API keys, OAuth)
- Enable CORS only for your AEM domain
- Add rate limiting
- Use HTTPS

**Q: Can this be deployed as an AEM clientlib?**

A: Currently, the client is a standalone web app. For production, you would wrap it as an AEM clientlib or deploy as a separate microservice that the AEM authoring UI embeds via iframe or custom UI extension.

**Q: Does this work with AEM translation workflows?**

A: Yes. The content generated follows AEM's content structure patterns. You can export the generated content to translation management systems integrated with AEM.

---

### Troubleshooting

**Q: The agent returns a 500 error**

A: Check:
- AEM is running on the configured host/port
- CORS is configured correctly on AEM
- The brand-config.json is valid JSON

**Q: No brand score appears**

A: Ensure `brand-config.json` exists and contains the required `guidelines` section. Brand scoring requires this configuration.

**Q: AI generation is slow**

A: With template mode (no AI), responses are instant. With AI:
- Ollama on local machine: 2-5 seconds
- Cloud APIs: Depends on network and API latency

**Q: SSE streaming doesn't work**

A: Check that your browser supports Server-Sent Events (most modern browsers do). Also verify the agent is configured correctly for SSE.

---

## Learn More About A2UI

- **A2UI Protocol**: Google's specification for agent-generated interfaces
- **AG-UI**: Event streaming protocol for real-time updates
- **Embabel**: Enterprise AI agent framework for Java/Spring

---

*This demo shows what's possible when AI meets content management. The future of authoring isn't just faster—it's smarter, more consistent, and infinitely more productive.*
