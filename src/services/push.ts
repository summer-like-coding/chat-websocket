import process from 'node:process'
import type { Message } from '@prisma/client'
import type { AsyncMessage } from 'rabbitmq-client'
import { commandOptions } from 'redis'
import { REDIS_KEY_HEARTBEAT_PREFIX, REDIS_KEY_ROOM_USER_PREFIX } from '../utils/settings.js'
import { buffer2Hex } from '../utils/buffer.js'
import { redisClient } from './redis.js'
import { io } from './websocket.js'
import { prisma } from './db.js'

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
    console.warn(`[IM] user: ${userId}, message:, ${JSON.stringify(message)}`)
  }

  // 2. 从 Redis 中查询 Room 中的所有用户
  const users = await redisClient.sMembers(
    commandOptions({ returnBuffers: true }),
    `${REDIS_KEY_ROOM_USER_PREFIX}${roomId}`,
  )

  // 3. 向所有用户发送消息
  users.forEach(async (userBuffer) => {
    const user = buffer2Hex(userBuffer)
    // 检查用户是否在线
    const heartbeat = await redisClient.get(`${REDIS_KEY_HEARTBEAT_PREFIX}${user}`)

    if (process.env.DEBUG) {
      console.warn(`[IM] user: ${user}, heartbeat: ${heartbeat}`)
    }

    if (!heartbeat) {
      return
    }
    io.to(user).emit('imMessage', message)
  })
}
