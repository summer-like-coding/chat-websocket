import process from 'node:process'
import { Connection } from 'rabbitmq-client'

const rabbit = new Connection('amqp://admin:password@localhost:5672')
rabbit.on('error', (err) => {
  console.warn('RabbitMQ connection error', err)
})
rabbit.on('connection', () => {
  console.warn('Connection successfully (re)established')
})

const sub = rabbit.createConsumer({
  queue: 'user-events',
  queueOptions: { durable: true },
  qos: { prefetchCount: 2 },
  exchanges: [{ exchange: 'my-events', type: 'topic' }],
  queueBindings: [{ exchange: 'my-events', routingKey: 'users.*' }],
}, async (msg) => {
  console.warn('received message (user-events)', msg)
})

sub.on('error', (err) => {
  console.warn('consumer error (user-events)', err)
})

const pub = rabbit.createPublisher({
  confirm: true,
  maxAttempts: 2,
  exchanges: [{ exchange: 'my-events', type: 'topic' }],
})

await pub.send(
  { exchange: 'my-events', routingKey: 'users.visit' },
  { id: 1, name: 'Alan Turing' },
)

await pub.send('user-events', { id: 1, name: 'Alan Turing' })

async function onShutdown() {
  await pub.close()
  await sub.close()
  await rabbit.close()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)
