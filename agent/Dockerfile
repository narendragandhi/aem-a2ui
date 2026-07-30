# Python Agent Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv for fast package management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies from pyproject.toml
RUN uv venv && uv pip install -r pyproject.toml

# Copy application code
COPY *.py ./

# Expose port
EXPOSE 10002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:10002/ || exit 1

# Run the application
CMD [".venv/bin/python", "-m", "uvicorn", "simple_agent:app", "--host", "0.0.0.0", "--port", "10002"]
