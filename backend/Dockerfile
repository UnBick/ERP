# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of your backend source code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the backend
CMD ["node", "index.js"]
