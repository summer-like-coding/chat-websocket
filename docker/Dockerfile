ARG NODE_VERSION=22.2.0
ARG NPM_REGISTRY=https://registry.npmjs.org

# Builder image
FROM node:${NODE_VERSION}-bookworm as builder
ARG NPM_REGISTRY
WORKDIR /app

COPY . ./

ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm -v && \
    npm config set registry ${NPM_REGISTRY} && \
    npm i -g pnpm && \
    pnpm -v && \
    pnpm config set registry ${NPM_REGISTRY} && \
    mv .env.production .env && \
    pnpm i && \
    pnpm db
RUN pnpm build
RUN mv /app/package.json /app/dist/ && \
    mv /app/pnpm-lock.yaml /app/dist/ && \
    mv /app/.env /app/dist/ && \
    mv /app/prisma /app/dist/ && \
    mv /app/tsconfig.json /app/dist/ && \
    cd /app/dist && \
    pnpm i --prod --ignore-scripts && \
    pnpm db && \
    rm -rf pnpm-lock.yaml && \
    rm -rf .env && \
    rm -rf prisma

# Production image
FROM node:${NODE_VERSION}-bookworm-slim
ARG DEBIAN_FRONTEND=noninteractive
WORKDIR /app
RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean
COPY --from=builder /app/dist /app
EXPOSE 3001
CMD ["node", "index.js"]
