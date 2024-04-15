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

```bash
cp .env.example .env.production
docker compose up -d
```

调试：

```bash
# Linux
DEBUG=* pnpm dev

# Windows
set DEBUG=* & pnpm dev
```
