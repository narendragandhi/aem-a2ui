# AEM Component Factory - Demo Script

**Duration:** 10-15 minutes
**Audience:** Developers, Product Managers, Content Authors
**Prerequisites:** Dev server running (`npm run dev`)

---

## Pre-Demo Checklist

- [ ] Terminal 1: `cd client && npm run dev` (http://localhost:5173)
- [ ] Terminal 2: `cd agent-java && mvn spring-boot:run` (http://localhost:10003)
- [ ] Browser open to http://localhost:5173
- [ ] Optional: AEM SDK running on http://localhost:4502

---

## Act 1: The Problem (1 min)

**[Show empty screen]**

> "Creating content for AEM typically involves multiple steps:
> - Writing copy
> - Configuring components in the author interface
> - Setting up content fragments
> - Packaging for deployment
>
> This can take hours per page. What if we could do it in seconds?"

---

## Act 2: Quick Content Generation (2 min)

**[Focus on the input field]**

> "Let's create a hero banner for a summer sale campaign."

**Type:**
```
Hero banner for summer outdoor furniture sale, 40% off, tropical vibes
```

**[Click Generate or press Ctrl+Enter]**

> "In seconds, we get three brand-aligned variations. Notice:
> - Headlines are action-oriented
> - Descriptions follow our brand voice
> - CTA text is conversion-focused"

**[Click through the 3 suggestions]**

> "Each variation has a different angle - we can pick the best one or refine further."

---

## Act 3: Live Preview & Editing (2 min)

**[Click "Apply" on a suggestion]**

> "The right panel shows a live preview exactly as it would appear in AEM."

**[Point to the preview]**

> "This isn't a mockup - it's using the same component structure as AEM Core Components."

**[Click "Edit" mode if available, or click on the title]**

> "I can edit inline - change the headline, tweak the description, update the CTA. All changes are instant."

**[Make a quick edit to the title]**

---

## Act 4: Content Wizard (2 min)

**[Scroll to Content Wizard section]**

> "For more control, we have a guided wizard."

**[Click through wizard steps]**

**Step 1:**
> "Choose component type - we support 15+ AEM Core Components"

**[Select "Product Card"]**

**Step 2:**
> "Set tone and style - Professional, Playful, Urgent, or Elegant"

**[Select "Elegant"]**

**Step 3:**
> "Add specific details"

**[Type: "Luxury teak patio set, weatherproof, 10-year warranty"]**

**[Click Generate]**

> "The AI uses these parameters plus our brand guidelines to generate perfectly targeted content."

---

## Act 5: Bulk Page Generation (2 min)

**[Switch to "Build" mode using the toggle]**

> "But what about full pages? Let's generate an entire landing page."

**[Click on "Landing Page" template in Bulk Generator]**

> "This template includes: Navigation, Hero, 3 Teasers, CTA, and Footer - a complete page structure."

**[Add page context:]**
```
Summer 2024 outdoor living collection launch
```

**[Click "Generate All Components"]**

> "Watch as each component generates in sequence..."

**[Components generate with progress bar]**

> "In under a minute, we have a complete page with 6 coordinated components."

---

## Act 6: Export Options (2 min)

**[Click on AEM Export Panel]**

> "Now let's look at what we can export."

**[Click through tabs]**

**JCR Tab:**
> "Raw JCR JSON - paste directly into CRXDE or use with content packages"

**Sling Model Tab:**
> "Sling Model format for headless delivery to SPAs and mobile apps"

**HTL Tab:**
> "Server-rendered HTL markup ready for AEM components"

---

## Act 7: Content Fragments (1 min)

**[Expand Content Fragment Panel]**

> "For headless architectures, we generate Content Fragments."

**[Select different model - e.g., "Article"]**

> "Six pre-built models: Article, Product, Hero, Testimonial, FAQ, Team Member"

**[Toggle some variations: "Mobile", "Email"]**

> "Add variations for different channels - mobile, email, A/B testing"

**[Show GraphQL tab]**

> "Export as GraphQL-ready JSON for your frontend applications"

---

## Act 8: Advanced Export (2 min)

**[Expand Advanced Export Panel]**

> "For developers, we have production-ready exports."

**[Click Package tab]**

> "Download as a FileVault content package - upload directly to AEM Package Manager"

**[Click Experience Fragment tab]**

> "Generate Experience Fragments for multi-channel delivery"

**[Show variation options: Web, Email, Social]**

**[Click Style System tab]**

> "Pre-built style policies and CSS for the AEM Style System"

**[Click Component Dialog tab]**

> "Touch UI dialog definitions - no manual XML writing"

**[Click Deploy tab]**

> "Or deploy directly to AEM with one click"

**[Show connection fields]**

---

## Act 9: The Value (1 min)

**[Return to main view with generated content]**

> "Let's recap what we just did:
>
> - Generated a complete landing page with 6 components
> - Created multiple content variations
> - Exported to JCR, Sling Model, HTL, Content Fragments
> - Generated Experience Fragments for email and social
> - Created deployment packages
>
> **Traditional approach:** 5-8 hours
> **With Component Factory:** Under 5 minutes
>
> That's a 60-100x improvement in content creation speed."

---

## Closing / Q&A

> "Questions?"

**Common Questions:**

**Q: Does it work with our existing AEM components?**
> "Yes - the component definitions map to standard AEM Core Components. You can also add custom components."

**Q: How does brand alignment work?**
> "Brand guidelines are configured in `brand-config.json` - voice, tone, messaging pillars, colors. The AI follows these in every generation."

**Q: Can we use our own LLM?**
> "Yes - supports Ollama (local), OpenAI, and Anthropic. Switch via environment variables."

**Q: What about approvals/workflows?**
> "Built-in review panel with comments, plus integration with AEM workflows for publication."

---

## Demo Recovery Tips

**If generation fails:**
- Check agent is running: http://localhost:10003
- Fallback: "The system generates mock content when the AI is unavailable - same structure, template-based"

**If AEM deploy fails:**
- "For the demo we're showing the export. In production, you'd configure AEM credentials."

**If something looks broken:**
- Refresh the page
- Clear localStorage: `localStorage.clear()`

---

## Quick Commands Reference

```bash
# Start everything
npm run dev                    # Client on :5173
mvn spring-boot:run           # Agent on :10003

# With AI
AI_ENABLED=true LLM_PROVIDER=ollama mvn spring-boot:run

# Build for production
npm run build
```

---

## Key Talking Points

1. **Speed** - 60-100x faster than manual content creation
2. **Consistency** - Brand guidelines enforced automatically
3. **Flexibility** - 15+ components, 6 export formats
4. **Integration** - Direct AEM deployment, Content Fragments, Experience Fragments
5. **Developer-friendly** - Dialogs, ClientLibs, Style System CSS included
