# A2UI Quick Start for AEM Developers

## Prerequisites

- AEM SDK running on `localhost:4502` (or configure via `AEM_AUTHOR_URL`)
- Java 21+ and Maven
- Node.js 18+
- (Optional) Ollama for local AI generation

## Quick Start (5 minutes)

### 1. Start the Backend

**Template mode (no AI):**
```bash
cd agent-java
AEM_ENABLED=true AEM_AUTHOR_URL=http://localhost:4502 mvn spring-boot:run
```

**AI mode (with Ollama):**
```bash
# First start Ollama (in separate terminal)
ollama run llama3.2

# Then start the agent
cd agent-java
AI_ENABLED=true LLM_PROVIDER=ollama AEM_ENABLED=true mvn spring-boot:run
```

The Java agent will start on `http://localhost:10003`.

### 2. Start the Frontend

```bash
cd client
npm install
npm run dev
```

The client will start on `http://localhost:5173`.

### 3. Open http://localhost:5173

You'll see the A2UI sidebar with the assistant panel.

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AEM_ENABLED` | `true` | Enable AEM SDK integration |
| `AEM_AUTHOR_URL` | `http://localhost:4502` | AEM Author URL |
| `AEM_USERNAME` | `admin` | AEM username |
| `AEM_PASSWORD` | `admin` | AEM password |
| `AI_ENABLED` | `false` | Enable AI generation |
| `LLM_PROVIDER` | `ollama` | LLM: openai, anthropic, ollama |
| `SECURITY_API_KEY_ENABLED` | `false` | Enable API key auth |
| `SECURITY_API_KEY` | - | Your API key |

## API Endpoints

### Core Endpoints (port 10003)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/tasks` | POST | Generate content with AI |
| `/advanced/tasks` | POST | Advanced content generation |
| `/recommend` | POST | AI component recommendations |

### SSE Streaming Endpoints (AG-UI Protocol v2.0)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stream/generate` | GET/POST | Basic SSE streaming with text events |
| `/stream/advanced` | GET/POST | Full AG-UI with all 17 event types + AEM DAM |
| `/stream/raw` | GET | Raw LLM token streaming |
| `/stream/health` | GET | Protocol health with all supported events |

### AEM Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/aem/health` | GET | AEM connection status |
| `/aem/config` | GET | AEM configuration |
| `/aem/content` | POST | Save content to AEM |
| `/dam/browse` | GET | Browse DAM assets |
| `/dam/search` | GET | Search DAM assets |

### Brand Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/brands` | GET | List all brands |
| `/brands/active` | GET | Get active brand config |
| `/brands` | POST | Create new brand |
| `/brands/{id}` | PUT | Update brand |

### Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhooks/aem` | POST | AEM event webhooks |
| `/webhooks/adobe-io` | POST | Adobe I/O events |
| `/webhooks/workflow` | POST | Workflow events |

### Monitoring

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/actuator/health` | GET | Health check |
| `/actuator/metrics` | GET | Application metrics |
| `/actuator/info` | GET | App info |

## Testing the Integration

### 1. Check Health
```bash
curl http://localhost:10003/actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "aem": {
      "status": "UP",
      "details": {
        "authorUrl": "http://localhost:4502",
        "contentRoot": "/content/wknd"
      }
    }
  }
}
```

### 2. Browse DAM
```bash
curl "http://localhost:10003/dam/browse?folder=/content/dam"
```

### 3. Generate Content (Template Mode)
```bash
curl -X POST http://localhost:10003/tasks \
  -H "Content-Type: application/json" \
  -d '{"message":{"role":"user","parts":[{"text":"hero banner for summer sale"}]}}'
```

### 4. Generate Content (AI Mode)
```bash
AI_ENABLED=true LLM_PROVIDER=ollama mvn spring-boot:run
# Then use the UI or API
```

### 5. Test SSE Streaming (AG-UI Protocol)
```bash
# Basic streaming
curl -N "http://localhost:10003/stream/generate?input=hero+banner&componentType=hero"

# Advanced streaming with AEM DAM integration
curl -N "http://localhost:10003/stream/advanced?input=summer+hiking&componentType=hero"

# Check supported events
curl http://localhost:10003/stream/health
```

**Expected AG-UI Events:**
```
event:RUN_STARTED
event:STEP_STARTED (🔍 Analyzing request...)
event:STEP_FINISHED
event:STEP_STARTED (🖼️ Searching AEM DAM...)
event:TOOL_CALL_START (aem_dam_search)
event:TOOL_CALL_ARGS
event:TOOL_CALL_END
event:TOOL_CALL_RESULT
event:STEP_FINISHED
event:STEP_STARTED (✨ Generating content...)
event:TEXT_MESSAGE_START
event:TEXT_MESSAGE_DELTA (word by word)
event:TEXT_MESSAGE_END
event:STATE_SNAPSHOT
event:RUN_FINISHED
```

## Running with Docker

```bash
docker-compose up -d
```

This starts:
- Java agent on port 10003
- Client on port 8080

## Troubleshooting

| Issue | Solution |
|-------|----------|
| AEM not connecting | Check AEM SDK is running on port 4502 |
| AI not generating | Start Ollama: `ollama run llama3.2` |
| 401 errors | Check AEM credentials in environment |
| Port conflicts | Agent uses 10003, Client uses 5173 |

## File Locations

```
aem-a2ui-demo/
├── agent-java/
│   ├── src/main/java/.../service/aem/   # AEM clients
│   ├── src/main/resources/application.properties
│   └── src/main/resources/brand-config.json
├── client/
│   ├── src/aem-assistant.ts
│   └── src/components/
└── docs/
    ├── PROTOCOL.md      # A2UI/AG-UI specs
    └── A2UI_STORY.md    # User journey
```
