# Gateway Frontend Dockerfile for Azure Container Apps
FROM node:20-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY frontend/modern/lz-labs-main/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/modern/lz-labs-main/ ./

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies and Express
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g express

# Copy built application and server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY frontend/modern/lz-labs-main/server.js ./

# Install only production dependencies
RUN npm ci --only=production

# Create non-root user for security
RUN adduser --disabled-password --gecos '' --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Start command using our custom server
CMD ["node", "server.js"]