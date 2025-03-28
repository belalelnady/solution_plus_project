# Stage 1: Build the application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build-all

# Stage 2: run the application
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the build output from the previous stage
COPY --from=build /app/build ./build
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public
COPY --from=build /app/ecosystem.config.js ./ecosystem.config.js
COPY package*.json ./

# Install only production dependencies and PM2
RUN npm ci --only=production && npm install -g pm2 && rm -rf /tmp/*

# Expose the application port
EXPOSE 3000


# Command to run the application
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "prod"]
