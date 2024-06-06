# 聊天服务 Socket.IO 模块

- [x] Socket.IO 鉴权
- [x] RabbitMQ 消息队列转发消息
- [ ] Redis 分布式锁

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

构建镜像：

```bash
docker build -t chat-system-socketio . -f docker/Dockerfile
```

请在主项目中启动环境。

> [!NOTE]
> 示例环境：
>
> ```properties
> DATABASE_URL="mongodb://root:password@mongo1:27017,mongo2:27017,mongo3:27017/chat_system?replicaSet=rs0&authSource=admin"
> RABBITMQ_URL="amqp://admin:password@rabbitmq:5672"
> SERVER_PORT="3001"
> SERVER_PATH="/socketio/"
> SERVER_CORS_ORIGIN="https://demo.com"
> NEXTAUTH_SECRET="xxxxxx"
> REDIS_URL="redis://redis:6379"
> ```

调试：

```bash
# Linux
DEBUG=* pnpm dev

# Windows
set DEBUG=* & pnpm dev
```
