# Project State Document

**Last Updated:** February 8, 2026
**Branch:** main
**Status:** Clean working tree, all tests passing

---

## Git History (Last 5 Commits)

| Commit | Message |
|--------|---------|
| `7291eab` | Add architecture documentation: problem analysis, integration patterns, scalability, security |
| `77b255b` | Add protocol documentation: explain A2UI vs AG-UI relationship |
| `5b533f2` | Add documentation for AEM developers: quickstart tutorial, concept mapping, FAQ, and diagram legend |
| `32100a3` | Enhance DAM integration and SSE streaming |
| `6d90084` | Add A2UI narrative story with comprehensive diagrams |

---

## Documentation Inventory

### Core Documentation

| File | Lines | Purpose |
|------|-------|---------|
| `README.md` | 158 | Entry point, overview, quick navigation |
| `QUICKSTART.md` | 174 | 5-minute hands-on tutorial |
| `CONCEPTS.md` | 378 | AEM-to-A2UI concept mapping |
| `PLAN.md` | 323 | Future implementation roadmap |
| `ARCHITECTURE.md` | 556 | Technical architecture deep dive |
| `CLAUDE.md` | 866 | Developer notes, technical decisions |

### Extended Documentation

| File | Lines | Purpose |
|------|-------|---------|
| `docs/A2UI_STORY.md` | 1,604 | Narrative with user journey, 15+ diagrams |
| `docs/PROTOCOL.md` | 270 | A2UI vs AG-UI protocol explanation |
| `docs/VALUE_PROPOSITION.md` | 166 | Business case, ROI metrics |

**Total Documentation:** ~4,000 lines

---

## Documentation Reading Paths

### For Business Stakeholders

```
VALUE_PROPOSITION.md (5 min)
    ↓
Quick understanding of value
```

### For AEM Developers

```
QUICKSTART.md (5 min)
    ↓
CONCEPTS.md (10 min)
    ↓
Reference: A2UI_STORY.md
```

### For Technical Architects

```
ARCHITECTURE.md (20 min)
    ↓
PROTOCOL.md (10 min)
    ↓
CONCEPTS.md (reference)
```

### For Developers

```
README.md → QUICKSTART.md → CLAUDE.md
    ↓
docs/A2UI_STORY.md
    ↓
Reference: docs/PROTOCOL.md, ARCHITECTURE.md
```

---

## Current Feature Status

### Completed Features

| Feature | Status | Location |
|---------|--------|----------|
| A2UI Protocol v0.8 | ✅ | `agent-java/src/main/java/.../AemContentAgent.java` |
| AG-UI Streaming | ✅ | `StreamingController.java`, `StreamingContentService.java` |
| Brand Scoring | ✅ | `AgentRecommendationService.java` |
| DAM Integration | ✅ | `AemDamClient.java` |
| 20 Component Types | ✅ | `client/src/components/` |
| SSE Streaming | ✅ | `client/src/components/streaming-content.ts` |
| Adobe Spectrum UI | ✅ | `client/` |
| Template Fallback | ✅ | `LlmService.java` |
| Multi-LLM Support | ✅ | OpenAI, Anthropic, Ollama |

### In Progress Features

| Feature | Status | Notes |
|---------|--------|-------|
| Workflow Integration | 🔄 | See PLAN.md |
| Review Comments | 🔄 | See PLAN.md |
| Version History | 🔄 | See PLAN.md |

---

## Test Status

### Java Tests

```
Tests run: 38, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

### Client Tests

```
5/5 test files | 15 passed, 0 failed
All tests passed
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21+ | Agent runtime |
| Spring Boot | 3.2 | Application framework |
| Embabel Agent | 0.3.1 | AI agent framework |
| Maven | 3.8+ | Build tool |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Lit | 3.x | Web components |
| Adobe Spectrum | Latest | Design system |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |

### Protocols

| Protocol | Version | Purpose |
|----------|---------|---------|
| A2UI | 0.8 | Message protocol |
| AG-UI | Latest | Streaming protocol |
| SSE | N/A | Real-time updates |

### LLM Providers

| Provider | Status | Notes |
|----------|--------|-------|
| OpenAI | ✅ | Cloud |
| Anthropic | ✅ | Cloud |
| Ollama | ✅ | Local (private) |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (secrets) |
| `docker-compose.yml` | Full stack (AEM + Agent + Client) |
| `docker-compose.dev.yml` | Development configuration |
| `agent-java/pom.xml` | Maven configuration |
| `client/package.json` | NPM dependencies |

---

## Project Structure

```
aem-a2ui-demo/
├── README.md                          # Entry point
├── QUICKSTART.md                      # 5-min tutorial
├── CONCEPTS.md                        # AEM mapping
├── PLAN.md                            # Roadmap
├── ARCHITECTURE.md                    # Architecture
├── CLAUDE.md                          # Developer notes
├── agent-java/                        # Java backend
│   ├── src/main/java/.../agent/      # Core agent
│   ├── src/main/java/.../controller/ # REST endpoints
│   ├── src/main/java/.../service/    # Business logic
│   ├── src/main/java/.../model/      # Data models
│   └── src/main/resources/           # Config, templates
├── client/                            # Frontend
│   ├── src/
│   │   ├── components/               # Web components
│   │   ├── data/                     # Brand config
│   │   ├── lib/                      # Types, utilities
│   │   └── services/                 # API clients
│   └── package.json
├── docs/
│   ├── A2UI_STORY.md                 # Narrative
│   ├── PROTOCOL.md                    # Protocols
│   └── VALUE_PROPOSITION.md           # Business case
└── docker-compose.yml                 # Full stack
```

---

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `AEM_HOST` | No | `localhost` | AEM instance |
| `AEM_PORT` | No | `4502` | AEM port |
| `AI_ENABLED` | No | `false` | Enable LLM |
| `LLM_PROVIDER` | No | `template` | openai/anthropic/ollama |
| `OPENAI_API_KEY` | If using OpenAI | - | API key |
| `ANTHROPIC_API_KEY` | If using Anthropic | - | API key |
| `OLLAMA_BASE_URL` | If using Ollama | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_MODEL` | If using Ollama | `llama3.2` | Model name |

---

## Quick Start Commands

### Development (No AI)

```bash
# Terminal 1
cd agent-java
mvn spring-boot:run

# Terminal 2
cd client
npm install
npm run dev
```

### Development (With AI)

```bash
# Start Ollama
ollama run llama3.2

# Terminal 1
cd agent-java
AI_ENABLED=true LLM_PROVIDER=ollama mvn spring-boot:run

# Terminal 2
cd client
npm run dev
```

### Testing

```bash
# Java tests
cd agent-java && mvn test

# Client tests
cd client && npm test
```

---

## Known Limitations

1. **AEM Integration**: Currently simulates AEM endpoints; requires real AEM for full functionality
2. **Workflow**: Basic submission implemented; full approval flow needs AEM workflow configuration
3. **Authentication**: Demo mode; production needs proper OAuth/API key management
4. **Rate Limiting**: Not implemented
5. **Multi-tenant**: Single brand configuration only

---

## Next Steps (from PLAN.md)

### High Priority

1. ✅ A2UI Narrative Documentation (DONE)
2. ✅ Protocol Documentation (DONE)
3. ✅ Architecture Documentation (DONE)
4. 🔄 WorkflowService/WorkflowController
5. 🔄 ReviewService/ReviewController

### Medium Priority

6. Complete DAM integration
7. Add version history component
8. Add review comments component
9. Multi-language support

### Low Priority

10. UI for brand configuration
11. Analytics dashboard
12. AEM clientlib packaging

---

## References

| Resource | Link |
|----------|------|
| GitHub | https://github.com/narendragandhi/aem-a2ui-demo |
| A2UI Protocol | https://developers.google.com/a2ui |
| AG-UI Protocol | https://github.com/ag-ui/protocol |
| Embabel Framework | https://github.com/embabel/framework |
| Adobe Spectrum | https://spectrum.adobe.com |

---

## Notes

- All documentation is commit-ready and pushed to `main` branch
- Clean working tree (no uncommitted changes)
- Tests pass consistently
- README serves as entry point with links to all documentation
