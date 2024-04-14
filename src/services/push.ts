import { Buffer } from 'node:buffer'
import type { Message } from '@prisma/client'
import type { AsyncMessage } from 'rabbitmq-client'
import { REDIS_KEY_ROOM_USER_PREFIX } from '../utils/settings'
import { redisClient } from './redis'
import { io } from './websocket'

/**
 * 处理 RabbitMQ 消息
 * @param msg RabbitMQ 消息
 */
export async function processMessage(msg: AsyncMessage) {
  // 1. 读取消息目标 RoomId 和消息体
  const message: Message = msg.body
  console.warn('Received message:', message)

  const { userId, roomId } = message

  // 2. 从 Redis 中查询 Room 中的所有用户
  const users = await redisClient.sMembers(`${REDIS_KEY_ROOM_USER_PREFIX}${roomId}`)

  // 3. 向所有用户发送消息，除了消息源用户
  users.forEach(async (user) => {
    if (user !== userId) {
      io.to(user).emit('imMessage', Buffer.from(message.content))
    }
  })
}
