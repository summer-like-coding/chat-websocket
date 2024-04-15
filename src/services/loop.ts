import process from 'node:process'
import { LOOP_INTERVAL, REDIS_KEY_ROOM_USER_PREFIX, REDIS_KEY_SCROLL_UPDATE, REDIS_KEY_USER_ROOM_PREFIX, SAFE_INTERVAL } from '../utils/settings'
import { hex2Buffer } from '../utils/buffer'
import { prisma } from './db'
import { redisClient } from './redis'

/**
 * 维护 Redis 中的 Room-User 双向映射
 * @param timestamp 更新时间戳
 */
export async function updateKey(timestamp: number) {
  const friendRooms = await prisma.friendRoom.findMany({
    where: {
      updatedAt: {
        lt: new Date(timestamp),
      },
    },
    orderBy: {
      updatedAt: 'asc',
    },
  })
  friendRooms.forEach(async (friendRoom) => {
    if (friendRoom.isDeleted) {
      await Promise.all([
        redisClient.sRem(
          `${REDIS_KEY_ROOM_USER_PREFIX}${friendRoom.roomId}`,
          hex2Buffer(friendRoom.user1Id),
        ),
        redisClient.sRem(
          `${REDIS_KEY_ROOM_USER_PREFIX}${friendRoom.roomId}`,
          hex2Buffer(friendRoom.user2Id),
        ),
        redisClient.sRem(
          `${REDIS_KEY_USER_ROOM_PREFIX}${friendRoom.user1Id}`,
          hex2Buffer(friendRoom.roomId),
        ),
        redisClient.sRem(
          `${REDIS_KEY_USER_ROOM_PREFIX}${friendRoom.user2Id}`,
          hex2Buffer(friendRoom.roomId),
        ),
      ])
    } else {
      await Promise.all([
        redisClient.sAdd(
          `${REDIS_KEY_ROOM_USER_PREFIX}${friendRoom.roomId}`,
          hex2Buffer(friendRoom.user1Id),
        ),
        redisClient.sAdd(
          `${REDIS_KEY_ROOM_USER_PREFIX}${friendRoom.roomId}`,
          hex2Buffer(friendRoom.user2Id),
        ),
        redisClient.sAdd(
          `${REDIS_KEY_USER_ROOM_PREFIX}${friendRoom.user1Id}`,
          hex2Buffer(friendRoom.roomId),
        ),
        redisClient.sAdd(
          `${REDIS_KEY_USER_ROOM_PREFIX}${friendRoom.user2Id}`,
          hex2Buffer(friendRoom.roomId),
        ),
      ])
    }
  })
  const groupRooms = await prisma.groupRoom.findMany({
    where: {
      updatedAt: {
        lt: new Date(timestamp),
      },
    },
    orderBy: {
      updatedAt: 'asc',
    },
  })
  groupRooms.forEach(async (groupRoom) => {
    const userGroups = await prisma.userGroup.findMany({
      where: {
        groupId: groupRoom.groupId,
      },
    })
    userGroups.forEach(async (userGroup) => {
      if (userGroup.isDeleted) {
        await Promise.all([
          redisClient.sRem(
            `${REDIS_KEY_ROOM_USER_PREFIX}${groupRoom.roomId}`,
            hex2Buffer(userGroup.userId),
          ),
          redisClient.sRem(
            `${REDIS_KEY_USER_ROOM_PREFIX}${userGroup.userId}`,
            hex2Buffer(groupRoom.roomId),
          ),
        ])
      }
      else {
        await Promise.all([
          redisClient.sAdd(
            `${REDIS_KEY_ROOM_USER_PREFIX}${groupRoom.roomId}`,
            hex2Buffer(userGroup.userId),
          ),
          redisClient.sAdd(
            `${REDIS_KEY_USER_ROOM_PREFIX}${userGroup.userId}`,
            hex2Buffer(groupRoom.roomId),
          ),
        ])
      }
    })
  })
  await redisClient.set(REDIS_KEY_SCROLL_UPDATE, timestamp.toString())
}

export async function loop() {
  // @todo: Redis 加锁
  const isExist = await redisClient.get(REDIS_KEY_SCROLL_UPDATE)
  const timestamp = Date.now() - SAFE_INTERVAL
  if (!isExist) {
    await updateKey(timestamp)
  } else {
    if (process.env.DEBUG) {
      console.warn('[Redis] Loop is running:', timestamp)
    }
    const lastTimestamp = Number.parseInt(await redisClient.get(REDIS_KEY_SCROLL_UPDATE) || '0')
    if (lastTimestamp < timestamp) {
      await updateKey(timestamp)
    }
  }
}

setInterval(async () => {
  try {
    await loop()
  }
  catch (e) {
    console.error(e)
  }
}, LOOP_INTERVAL)
