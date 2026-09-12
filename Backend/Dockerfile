FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

# Do NOT copy .env into the image. Secrets must be injected at runtime via
# the orchestrator (docker-compose env_file / Kubernetes secrets / Vault).
EXPOSE 5000

# Run as non-root for least privilege. Chown app files so the runtime user can
# read deps and perform any local writes without permission errors.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
  && chown -R appuser:appgroup /app
USER appuser

# Production healthcheck: verify the HTTP server responds on /health.
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
