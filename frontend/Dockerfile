# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (creates /app/dist folder)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config (we will create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]