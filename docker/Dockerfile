ARG NODE_VERSION=22.2.0
ARG NPM_REGISTRY=https://registry.npmjs.org
ARG DEBIAN_MIRROR=mirrors.ustc.edu.cn

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
RUN mv package.json dist/ && \
    mv pnpm-lock.yaml dist/ && \
    mv .env dist/ && \
    mv prisma/ dist/ && \
    mv tsconfig.json dist/ && \
    cd dist/ && \
    pnpm i --prod --ignore-scripts && \
    pnpm db && \
    rm -rf pnpm-lock.yaml prisma/

# Production image
FROM node:${NODE_VERSION}-bookworm-slim
ARG DEBIAN_FRONTEND=noninteractive
ARG DEBIAN_MIRROR
WORKDIR /app

RUN sed -i "s/deb.debian.org/${DEBIAN_MIRROR}/g" /etc/apt/sources.list.d/debian.sources && \
    apt update && \
    apt install -y openssl && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist /app

EXPOSE 3001
CMD ["node", "index.js"]
