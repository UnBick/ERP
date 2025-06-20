# Use official Node.js image as the build environment
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x node_modules/.bin/react-scripts
RUN npm run build

# Use a lightweight web server to serve the build
FROM node:18-slim as production
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules/.bin/serve ./node_modules/.bin/serve
COPY --from=build /app/node_modules/serve ./node_modules/serve

EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
