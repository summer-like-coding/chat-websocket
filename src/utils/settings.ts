/**
 * Redis Key: 心跳
 */
export const REDIS_KEY_HEARTBEAT_PREFIX = 'im:heartbeat:'
/**
 * Redis Key: 心跳过期时间
 */
export const REDIS_KEY_HEARTBEAT_EXPIRE = 60
/**
 * Redis Key: 用户房间映射表
 */
export const REDIS_KEY_USER_ROOM_PREFIX = 'im:user.rooms:'
/**
 * Redis Key: 房间用户映射表
 */
export const REDIS_KEY_ROOM_USER_PREFIX = 'im:room.users:'
/**
 * Redis Key: 滚动更新时间戳
 */
export const REDIS_KEY_SCROLL_UPDATE = 'im:scroll.update'
/**
 * 安全间隔
 */
export const SAFE_INTERVAL = 10000
/**
 * 循环间隔
 */
export const LOOP_INTERVAL = 1000
