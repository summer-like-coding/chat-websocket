ARG NODE_VERSION=20.11.0
ARG NPM_REGISTRY=https://registry.npmmirror.com/

# Builder image
FROM node:${NODE_VERSION}-bookworm as builder
ARG NPM_REGISTRY
WORKDIR /app

COPY . ./

ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm -v \
  && npm config set registry ${NPM_REGISTRY} \
  && npm i -g pnpm \
  && pnpm -v \
  && pnpm config set registry ${NPM_REGISTRY} \
  && mv .env.production .env \
  && pnpm i
RUN pnpm build
RUN cp /app/package.json /app/dist/package.json \
  && cp /app/pnpm-lock.yaml /app/dist/pnpm-lock.yaml \
  && cd /app/dist \
  && pnpm i --prod --ignore-scripts \
  && rm -rf pnpm-lock.yaml

# Production image
FROM node:${NODE_VERSION}-bookworm-slim
WORKDIR /app

COPY --from=builder /app/dist /app

EXPOSE 3000

CMD ["node", "index.js"]
