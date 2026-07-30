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

## Testing

```bash
# Client
cd client && npm test
# Java (always use clean)
cd agent-java && mvn clean test
# Storybook
cd client && npm run storybook
```

## Troubleshooting

- **Stale class files**: Always use `mvn clean test` (not just `mvn test`)
- **Rollup/Module error**: `rm -rf node_modules package-lock.json && npm install`
- **Ollama connection**: Ensure `ollama serve` is running
- **Extension deployment**: Needs Adobe Developer Console credentials
