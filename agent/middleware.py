"""Security middleware for the Python agent."""
import time
import uuid
import logging
from collections import defaultdict
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        response = await call_next(request)

        # Add security headers
        response.headers["X-Request-Id"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' https: data: blob:; "
            "font-src 'self' data:; "
            "connect-src 'self' ws: wss:; "
            "frame-ancestors 'none'"
        )

        # Log request
        duration = (time.time() - start_time) * 1000
        logger.info(
            "[%s] %s %s - %d (%.2fms)",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration
        )

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter."""

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only rate limit task endpoints
        if request.url.path not in ["/tasks"]:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        now = time.time()

        # Clean old requests
        self.requests[client_ip] = [
            t for t in self.requests[client_ip]
            if now - t < self.window_seconds
        ]

        # Check rate limit
        if len(self.requests[client_ip]) >= self.max_requests:
            return Response(
                content='{"error": "Too many requests. Please try again later."}',
                status_code=429,
                media_type="application/json"
            )

        self.requests[client_ip].append(now)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(
            self.max_requests - len(self.requests[client_ip])
        )

        return response

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"


def validate_task_request(data: dict) -> tuple[bool, str]:
    """Validate task request data."""
    if not data:
        return False, "Request body is required"

    message = data.get("message")
    if not message:
        return False, "Message is required"

    parts = message.get("parts")
    if not parts or not isinstance(parts, list):
        return False, "Message must have parts array"

    if len(parts) > 100:
        return False, "Too many parts (max: 100)"

    for part in parts:
        text = part.get("text", "")
        if len(text) > 10000:
            return False, "Text too long (max: 10000 characters)"

    return True, ""


def sanitize_input(text: str) -> str:
    """Sanitize user input."""
    if not text:
        return ""
    # Remove control characters except newlines and tabs
    import re
    return re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', '', text).strip()
