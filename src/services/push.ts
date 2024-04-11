import type { AsyncMessage } from 'rabbitmq-client'
import { io } from './websocket'

/**
 * 处理 RabbitMQ 消息
 * @param msg RabbitMQ 消息
 */
export async function processMessage(msg: AsyncMessage) {
  io.emit('simpleEmit', `${msg}`)
  // 1. 读取消息目标 RoomId 和消息体
  // 2. 从 Redis 中查询 Room 中的所有用户
  // 3. 向所有用户发送消息，除了消息源用户
}
