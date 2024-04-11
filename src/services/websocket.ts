import process from 'node:process'
import { Server } from 'socket.io'
import { validToken } from '../utils/auth'
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketWithUserId,
} from '../types/socket-io'

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  path: process.env.SERVER_PATH,
})

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  const userId = await validToken(token)
  if (userId) {
    (socket as SocketWithUserId).userId = userId
    next()
  } else {
    next(new Error('Invalid token'))
  }
})

io.on('connection', async (socket) => {
  const userId = (socket as SocketWithUserId).userId
  socket.join(userId)
  io.to(userId).emit('noArg')
})

io.listen(Number.parseInt(process.env.SERVER_PORT || '3000'))
