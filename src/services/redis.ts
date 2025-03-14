import process from 'node:process'
import { createClient } from 'redis'

export const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('error', err => console.error('[Redis] client error:', err))
await redisClient.connect()

async function onShutdown() {
  await redisClient.quit()
}
process.on('SIGINT', onShutdown)
process.on('SIGTERM', onShutdown)
