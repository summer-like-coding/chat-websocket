import type { Buffer } from 'node:buffer'
import type { Socket } from 'socket.io'

export interface ServerToClientEvents {
  noArg: () => void
  simpleEmit: (a: string) => void
  basicEmit: (a: number, b: string, c: Buffer) => void
  withAck: (d: string, callback: (e: number) => void) => void
}

export interface ClientToServerEvents {
  hello: () => void
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
