import type { AsyncMessage } from 'rabbitmq-client'
import { io } from './websocket'

/**
 * 处理 RabbitMQ 消息
 * @param msg RabbitMQ 消息
 */
export async function processMessage(msg: AsyncMessage) {
  io.emit('message', `${msg}`)
}
