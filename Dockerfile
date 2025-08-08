# =================================
# Development-friendly Docker build for MTG Deck Manager API
# =================================

FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mtguser -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (dev + prod) for ts-node
RUN npm ci

# Copy source code
COPY --chown=mtguser:nodejs src/ ./src/
COPY --chown=mtguser:nodejs scripts/ ./scripts/

# Create directories for uploads and logs
RUN mkdir -p uploads logs && \
    chown -R mtguser:nodejs uploads logs

# Switch to non-root user
USER mtguser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application in development mode (with ts-node + tsconfig-paths)
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev:direct"]