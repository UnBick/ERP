# Use official Node.js image as the build environment
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN chmod +x node_modules/.bin/react-scripts
RUN npm run build

# Production stage - alternative with local serve
FROM node:18-slim AS production

WORKDIR /app
RUN npm install -g serve

# Copy the built application
COPY --from=build /app/build ./build

EXPOSE 3000

# Use global serve installation
CMD ["serve", "-s", "build", "-l", "3000"]
