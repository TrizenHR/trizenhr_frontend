# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Cache-bust: CapRover injects CAPROVER_GIT_COMMIT_SHA on Git deploy. Manual/CI: --build-arg CACHEBUST=$(date +%s)
# Force Build in CapRover or pass CACHEBUST to guarantee fresh image.
ARG CACHEBUST=1
ARG CAPROVER_GIT_COMMIT_SHA=unknown
RUN echo "Cache bust: ${CACHEBUST} commit=${CAPROVER_GIT_COMMIT_SHA}"

# Bake build id into app so /api/health can report which version is live
ENV NEXT_PUBLIC_BUILD_ID=${CAPROVER_GIT_COMMIT_SHA}

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}

# Copy package files
COPY package*.json ./

# Install dependencies (cache invalidated when package*.json changes)
RUN npm ci

# Copy source code and config
COPY . .

# Nuke Next.js build cache so we never reuse stale .next/standalone
RUN rm -rf .next node_modules/.cache

# Optional: disable Next.js build cache (slower builds, zero ghost versions)
ENV NEXT_DISABLE_BUILD_CACHE=1

# Build Next.js application with standalone output
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept build arguments to pass to runtime (for reference, already embedded in build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV

# Set as runtime env vars (though already embedded in build, useful for debugging)
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check using Node.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js
CMD ["node", "server.js"]
