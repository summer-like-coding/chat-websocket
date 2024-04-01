import process from 'node:process'
import { Server } from 'socket.io'

export const io = new Server({})

async function isValid(token: string) {
  return token === 'valid'
}

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (await isValid(token)) {
    next()
  } else {
    next(new Error("invalid token"))
  }
})

io.listen(Number.parseInt(process.env.SERVER_PORT || '3000'))
