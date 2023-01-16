import Fastify from 'fastify';

const SERVER_PORT = 3333
const server = Fastify()

server.get('/', () => { })

server.listen({
  port: SERVER_PORT
}).then(() => {
  console.log(`HTTP server running at port ${SERVER_PORT} 🚀`)
})