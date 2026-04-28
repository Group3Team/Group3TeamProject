FROM node:lts-alpine3.22 AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine

# Create directories in nginx container
WORKDIR /usr/share/nginx/html
RUN mkdir -p assets public images src-assets

# Copy entire dist directory (includes index.html + assets folder with JS/CSS)
COPY --from=builder /app/dist/. ./

COPY --from=builder /app/public/. ./public/
COPY --from=builder /app/src/assets/. ./src-assets/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
