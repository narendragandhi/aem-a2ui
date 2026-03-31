# Production Readiness Checklist

This checklist captures the minimum work required before production deployment. Items are ordered by value and risk reduction.

## 1) Security & Access Control

1. Replace IMS stub with full Adobe IMS OAuth flow and token validation.
1. Enforce authorization policies per endpoint (author, admin, system).
1. Lock down CORS per environment with explicit allow-lists.
1. Add rate limiting and request size limits for SSE and AI endpoints.
1. Protect internal agent-to-AEM calls with API keys or mTLS.

## 2) Governance & Approval

1. Persist governance outcomes in AEM (metadata or audit log).
1. Enforce HITL approvals server-side before apply/update.
1. Externalize governance policies into per-site or per-brand config.

## 3) Observability & Auditability

1. Add structured logging with correlation IDs on all requests.
1. Integrate OpenTelemetry for traces and metrics.
1. Persist telemetry in a durable store (DB or log pipeline).
1. Add audit trails for apply/update actions.

## 4) Reliability & Error Handling

1. Add retries + circuit breakers for AEM calls.
1. Add timeouts + backpressure for streaming endpoints.
1. Define and document error taxonomy for UI and API.
1. Implement graceful degradation if AEM or LLM is down.

## 5) CI/CD and Quality Gates

1. Run Checkstyle + JaCoCo in CI with coverage thresholds.
1. Run Playwright visual regression in CI with managed baselines.
1. Add integration tests against AEM SDK (or approved mocks).

## 6) Configuration & Environment Separation

1. Enforce feature flags (demo mode off in production).
1. Use secrets management (Vault or KMS).
1. Separate demo/test/staging/prod environments.

## 7) Operational Docs

1. Runbook for scaling, on-call, and incident response.
1. Security posture document + threat model.
1. SLO/SLA definitions and error budgets.
