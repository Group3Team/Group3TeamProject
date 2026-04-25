# LTS version 24-aline3.22 LTS
FROM node:lts-alpine3.22

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]