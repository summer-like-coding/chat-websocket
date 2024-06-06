import { randomUUID } from 'node:crypto'
import { redisClient } from '../services/redis.js'

const lua = String.raw
const RELEASE_SCRIPT = lua`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`

export class SimpleRedisLock {
  lock_name: string
  expire: number = 10000
  timeout: number = 10000
  uuid: string = ''
  space_time: number = 100

  constructor(lock_name: string) {
    this.lock_name = lock_name
    this.uuid = this.getUUID()
  }

  async try_acquire(): Promise<boolean> {
    const result = await redisClient.set(
      this.lock_name,
      this.uuid,
      {
        NX: true,
        PX: this.expire,
      },
    )
    return result === 'OK'
  }

  async acquire(): Promise<boolean> {
    const start = Date.now()
    while (true) {
      if (await this.try_acquire()) {
        return true
      }
      if (Date.now() - start >= this.timeout) {
        return false
      }
      await this.sleep(this.space_time)
    }
  }

  async release(): Promise<boolean> {
    const result = await redisClient.eval(
      RELEASE_SCRIPT,
      {
        arguments: [this.lock_name, this.uuid],
      },
    )
    return result === 1
  }

  getUUID() {
    return randomUUID()
  }

  async sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}
