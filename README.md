# 聊天服务 Socket.IO 模块

- [x] Socket.IO 鉴权
- [x] RabbitMQ 消息队列转发消息

开始：

```bash
cp .env.example .env
```

复制并配置 `.env` 文件，需要指定 MongoDB 和 RabbitMQ 的路径。

安装：

```bash
pnpm i
```

开发：

```bash
pnpm dev
```

构建并运行：

```bash
pnpm build
pnpm preview
```

Docker 构建：

配置 `.env.production` 文件，然后运行：

```bash
cp .env.example .env.production
```

创建网络并运行：

```bash
docker network create --driver=bridge chat-system
docker compose up -d
```

调试：

```bash
# Linux
DEBUG=* pnpm dev

# Windows
set DEBUG=* & pnpm dev
```
