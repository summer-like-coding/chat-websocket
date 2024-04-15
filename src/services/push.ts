import { Buffer } from 'node:buffer'
import process from 'node:process'
import type { Message } from '@prisma/client'
import type { AsyncMessage } from 'rabbitmq-client'
import { commandOptions } from 'redis'
import { REDIS_KEY_HEARTBEAT_PREFIX, REDIS_KEY_ROOM_USER_PREFIX } from '../utils/settings'
import { buffer2Hex, hex2Buffer } from '../utils/buffer'
import { redisClient } from './redis'
import { io } from './websocket'
import { prisma } from './db'

/**
 * 处理 RabbitMQ 消息
 * @param msg RabbitMQ 消息
 */
export async function processMessage(msg: AsyncMessage) {
  // 1. 读取消息目标 RoomId 和消息体
  const body: Message = msg.body
  const { userId, roomId } = body

  const message = await (async () => {
    if (body.id === undefined) {
      // 数据尚未持久化
      return await prisma.message.create({
        data: body,
      })
    } else {
      // 数据已经持久化
      return body
    }
  })()

  if (process.env.DEBUG) {
    console.warn(`[IM] user: ${userId}, message:, ${message}`)
  }

  // 2. 从 Redis 中查询 Room 中的所有用户
  const users = await redisClient.sMembers(
    commandOptions({ returnBuffers: true }),
    hex2Buffer(`${REDIS_KEY_ROOM_USER_PREFIX}${roomId}`),
  )

  // 3. 向所有用户发送消息
  users.forEach(async (userBuffer) => {
    const user = buffer2Hex(userBuffer)
    // 检查用户是否在线
    const heartbeat = await redisClient.get(`${REDIS_KEY_HEARTBEAT_PREFIX}${user}`)
    if (!heartbeat) {
      return
    }
    io.to(user).emit('imMessage', Buffer.from(JSON.stringify(message)))
  })
}
