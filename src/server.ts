import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import cors from '@fastify/cors'

const SERVER_PORT = 3333
const server = Fastify()

server.register(cors, { origin: ['http://localhost:3000'] })

const prisma = new PrismaClient()

server.get('/', async () => {
  const habits = await prisma.habit.findMany()

  return habits
})

server.listen({
  port: SERVER_PORT
}).then(() => {
  console.log(`HTTP server running on http://localhost:${SERVER_PORT} 🚀`)
})
