# LTS version 24-aline3.22
FROM node:24-alpine3.22

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install && \
    npm install @rollup/rollup-linux-arm64-musl --save-optional 2>/dev/null || true && \
    npm install @esbuild/linux-arm64 --save-optional 2>/dev/null || true

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
