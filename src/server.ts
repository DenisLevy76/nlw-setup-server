import Fastify from 'fastify';
import cors from '@fastify/cors'
import { routes } from './routes';

const SERVER_PORT = 3333
const server = Fastify()

server.register(cors, { origin: ['http://localhost:3000'] })
server.register(routes)


server.listen({
  port: SERVER_PORT
}).then(() => {
  console.log(`HTTP server running on http://localhost:${SERVER_PORT} 🚀`)
})
