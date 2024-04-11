import process from 'node:process'
import { Server } from 'socket.io'
import { validToken } from '../utils/auth'

export const io = new Server({})

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (await validToken(token)) {
    next()
  } else {
    next(new Error('Invalid token'))
  }
})

io.listen(Number.parseInt(process.env.SERVER_PORT || '3000'))
