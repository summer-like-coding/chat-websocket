import type { Message } from '@prisma/client'
import type { Socket } from 'socket.io'

export interface ServerToClientEvents {
  hello: (data: string) => void
  imMessage: (data: Message) => void
}

export interface ClientToServerEvents {
  ping: (data: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  name: string
  age: number
}

export type SocketWithUserId = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> & { userId: string }
