FROM node:18-alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port 5000 as required
EXPOSE 5000

# Start the server
CMD ["node", "src/index.js"]