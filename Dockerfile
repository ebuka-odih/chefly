# Chefly backend image.
# Dokploy builds this from the repo root (buildType=dockerfile, dockerfile=Dockerfile),
# so the build context is the whole repo and we only copy the backend/ dir.
FROM python:3.11-slim

# psycopg2-binary needs no build deps, but curl is handy for healthchecks.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install dependencies first for better layer caching.
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code.
COPY backend/app ./app

# Generated images are written here; declared as a volume so they can persist
# across restarts if Dokploy mounts one.
RUN mkdir -p /app/app/static/images
VOLUME ["/app/app/static"]

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

# Single uvicorn worker keeps memory low; bump --workers for more throughput.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
