import process from 'node:process'
import { Connection } from 'rabbitmq-client'
import { processMessage } from './push.js'

export const rabbit = new Connection(process.env.RABBITMQ_URL)

rabbit.on('error', (err) => {
  console.error('[RabbitMQ] Connection error', err)
})
rabbit.on('connection', () => {
  console.warn('[RabbitMQ] Connection successfully established')
})

const sub = rabbit.createConsumer({
  queue: 'im-events',
  queueOptions: { durable: true },
  qos: { prefetchCount: 2 },
  exchanges: [{ exchange: 'my-events', type: 'topic' }],
  queueBindings: [{ exchange: 'my-events', routingKey: 'users.*' }],
}, processMessage)

sub.on('error', (err) => {
  console.error('[RabbitMQ] consumer error (im-events)', err)
})

async function onShutdown() {
  await sub.close()
  await rabbit.close()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)
