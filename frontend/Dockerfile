# Vite requires 20.19+ , node:lts-alpine would always pull current LTS version. 
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

#environment
ARG VITE_BASE_URL=http://localhost:8000
ENV VITE_BASE_URL=$VITE_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for Vite build)
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Set working directory for nginx
WORKDIR /usr/share/nginx/html

# Copy built React app to Nginx static directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx with proper error handling
CMD ["nginx", "-g", "daemon off;"]