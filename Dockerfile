# Use Node.js 20 as the base image
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Run the build script defined in package.json
# This runs 'vite build' and then bundles server.ts with esbuild
RUN npm run build

# Final production stage
FROM node:20-slim

WORKDIR /app

# Copy package files for production install
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# The server listens on the PORT environment variable (default 3000)
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.cjs"]
