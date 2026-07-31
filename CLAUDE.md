# AEM A2UI - Development Notes

Key decisions, architecture choices, and updates made during development.

## Project Overview

AI-powered content assistant for Adobe Experience Manager using A2UI Protocol v0.8, Embabel Agent Framework, multi-LLM (OpenAI/Anthropic/Ollama), Adobe Spectrum design system.

## Architecture

```
Web Client (Lit) ──→ Java Agent (Spring Boot 3.5.0)
                       ├── Embabel Agent Framework 1.0.0 GA
                       ├── LlmService (OpenAI/Anthropic/Ollama via HTTP)
                       ├── A2UI message generation
                       └── AEM SDK integration
```

## Key Technical Decisions

### Embabel Integration
`embabel-agent-starter` 1.0.0 GA in `pom.xml`. Bytecode incompatibility resolved in GA.

### Multi-LLM Provider
`LlmService` switches provider based on `LLM_PROVIDER` env var. Falls back to template-based generation when LLM fails.

### AI Pipeline (Important)
`AgentInvocation.create(agentPlatform, ContentSuggestion.class).invoke()` was **broken** (Embabel bug). Replaced with `llmService.generateObject(prompt, ContentSuggestion.class)` which calls Ollama/OpenAI/Anthropic directly via HTTP. See `StreamingContentService.java` and `ContentSuggestionService.java`.

### Feature Flags
All controllers gated with `@ConditionalOnProperty`. Centralized in `FeatureFlag` enum + `FeatureFlagService` using Spring `Environment`.

### App Builder Universal Editor Extension
`extension/` is an App Builder extension on the `universal-editor/ui/1` extension point.
- `app.config.yaml` root is a top-level `extensions:` map with `$include: src/universal-editor-ui-1/ext.config.yaml` (the legacy `application.extensions` list is NOT supported by `aio` CLI).
- `web-src/` = Parcel web bundle; `actions/` = OpenWhisk runtime actions; hooks regenerate `src/app-metadata.json` via `@adobe/uix-guest/scripts/generate-metadata.js`.
- Build output: `dist/universal-editor-ui-1/web-prod/` (served at namespace root, so HTML must use absolute `/...` paths).
- Runtime actions use Node 18+ global `fetch` — do NOT add `node-fetch` (v3 is ESM-only and breaks CJS actions).
- The rail host (`panel.html`) iframes the Java agent's `/extension-panel` endpoint; the client app does not yet handle the `ue-event` postMessages the panel relays.

## Running

### Template Mode
```bash
cd agent-java && mvn spring-boot:run
cd client && npm run dev
```

### With AI (Ollama)
```bash
ollama run llama3.2
AI_ENABLED=true LLM_PROVIDER=ollama cd agent-java && mvn spring-boot:run
cd client && npm run dev
```

### With AEM SDK
```bash
java -jar aem-author-p4502.jar
AEM_ENABLED=true cd agent-java && mvn spring-boot:run
cd client && npm run dev
```

### Docker
```bash
docker compose up
```

### Extension
```bash
cd extension
npm install
npm run build    # aio app build (actions + web bundle)
npm run lint     # eslint src/
# aio app deploy # requires aio login (Adobe Developer Console credentials)
```

## Testing

```bash
# Client
cd client && npm test
# Java (always use clean)
cd agent-java && mvn clean test
# Storybook
cd client && npm run storybook
# Extension
cd extension && npm test
```

## Troubleshooting

- **Stale class files**: Always use `mvn clean test` (not just `mvn test`)
- **Rollup/Module error**: `rm -rf node_modules package-lock.json && npm install`
- **Ollama connection**: Ensure `ollama serve` is running
- **`aio app build` fails with "Couldn't find configuration"**: `app.config.yaml` must use the `extensions:` top-level map with `$include` (not `application.extensions:`), and the included `ext.config.yaml` must declare `operations.view[].type: web` + `impl`
- **Extension deployment**: Needs Adobe Developer Console credentials (`aio login`)
