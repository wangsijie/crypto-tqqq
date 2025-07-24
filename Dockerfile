# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/

# Create logs directory
RUN mkdir -p logs

# Set environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV DRY_RUN=true

# Expose health check endpoint (if needed in future)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD ps aux | grep -v grep | grep node || exit 1

# Run the scheduler by default
CMD ["node", "dist/scheduler.js"]