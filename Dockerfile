# Use Node.js 20 as the base image
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Run the build script
RUN npm run build

# Final production stage
FROM node:20-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built assets - ensure it's copied to dist/
COPY --from=builder /app/dist ./dist

# The server listens on the PORT environment variable
# Cloud Run sets this automatically, but we provide a default just in case.
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.cjs"]
