import process from 'node:process'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

export async function sha256(t: string) {
  return crypto.createHash('sha256').update(t).digest('base64url')
}

/**
 * 验证 token 是否有效
 * @param token 鉴权 token
 * @returns boolean
 *
 * 验证算法如下：
 *
 * ```js
 * const t = Date.now()
 * const sha = await sha256(`${userId}#${AUTH_SECRET}#${t}`)
 * const hash = await bcrypt.hash(`${userId}#${sha}`, 10)
 * const token = `${userId}#${t}#${hash}`
 * ```
 */
export async function validToken(token: string): Promise<string | false> {
  const tokenParts = token.split('#')
  if (tokenParts.length !== 3) {
    return false
  }
  const [userId, t, hash] = tokenParts
  const AUTH_SECRET = process.env.AUTH_SECRET!
  const sha = await sha256(`${userId}#${AUTH_SECRET}#${t}`)
  const res = await bcrypt.compare(`${userId}#${sha}`, hash)
  return res ? userId : false
}
