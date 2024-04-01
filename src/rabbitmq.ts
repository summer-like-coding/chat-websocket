import process from 'node:process'
import { Connection } from 'rabbitmq-client'

export const rabbit = new Connection(process.env.RABBITMQ_URL)

rabbit.on('error', (err) => {
  console.log('[RabbitMQ] Connection error', err)
})
rabbit.on('connection', () => {
  console.log('[RabbitMQ] Connection successfully established')
})

const sub = rabbit.createConsumer({
  queue: 'user-events',
  queueOptions: { durable: true },
  qos: { prefetchCount: 2 },
  exchanges: [{ exchange: 'my-events', type: 'topic' }],
  queueBindings: [{ exchange: 'my-events', routingKey: 'users.*' }],
}, async (msg) => {
  console.log('[RabbitMQ] received message (user-events)', msg)
})

sub.on('error', (err) => {
  console.log('[RabbitMQ] consumer error (user-events)', err)
})


async function onShutdown() {
  await sub.close()
  await rabbit.close()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)
