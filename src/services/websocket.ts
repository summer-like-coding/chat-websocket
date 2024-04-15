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
  cors: {
    origin: process.env.SERVER_CORS_ORIGIN,
  },
})

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  const userId = await validToken(token)
  if (userId) {
    (socket as SocketWithUserId).userId = userId
    next()
  } else {
    if (process.env.DEBUG) {
      console.warn('[SocketIO] Invalid token:', token)
    }
    next(new Error('Invalid token'))
  }
})

io.on('connection', async (socket) => {
  const userId = (socket as SocketWithUserId).userId
  if (process.env.DEBUG) {
    console.warn('[SocketIO] User connected:', userId)
  }
  socket.join(userId)
  io.to(userId).emit('hello', 'world')
})

io.listen(Number.parseInt(process.env.SERVER_PORT || '3000'))
