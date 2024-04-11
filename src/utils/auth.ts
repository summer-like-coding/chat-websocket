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
 * const id = 'userId'
 * const t = Date.now()
 * const sha = await sha256(`${id}#${AUTH_SECRET}#${t}`)
 * const hash = await bcrypt.hash(`${id}#${sha}`, 10)
 * const token = `${id}#${t}#${hash}`
 * ```
 */
export async function validToken(token: string) {
  const tokenParts = token.split('#')
  if (tokenParts.length !== 3) {
    return false
  }
  const [id, t, hash] = tokenParts
  const AUTH_SECRET = process.env.AUTH_SECRET!
  const sha = await sha256(`${id}#${AUTH_SECRET}#${t}`)
  return await bcrypt.compare(`${id}#${sha}`, hash)
}
