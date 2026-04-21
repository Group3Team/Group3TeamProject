FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install && \
    npm install @rollup/rollup-linux-arm64-musl --save-optional 2>/dev/null || true && \
    npm install @esbuild/linux-arm64 --save-optional 2>/dev/null || true

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
