import Fastify from 'fastify'
import fjwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import authRoutes from './routes/auth.js'
import clientRoutes from './routes/clients.js'
import taskRoutes from './routes/tasks.js'

const server = Fastify({ logger: true })

// CORS
await server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

// JWT
await server.register(fjwt, {
  secret: process.env.JWT_SECRET || 'smm-tracker-secret-key',
})

// Swagger
await server.register(swagger, {
  openapi: {
    info: {
      title: 'SMM Tracker API',
      description: 'REST API for SMM Tracker — Clients, Tasks, Payments',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Client: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            brand: { type: 'string' },
            platforms: { type: 'array', items: { type: 'string' } },
            status: { type: 'string' },
            priority: { type: 'boolean' },
            notes: { type: 'string' },
            createdAt: { type: 'string' },
          }
        }
      }
    },
  },
})

await server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
})

// Routes
await server.register(authRoutes)
await server.register(clientRoutes)
await server.register(taskRoutes)

// Health check
server.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Health check',
    response: {
      200: {
        type: 'object',
        properties: { status: { type: 'string' } }
      }
    }
  }
}, async () => ({ status: 'ok' }))

// Start
const start = async () => {
  try {
    await server.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
    console.log('Server running on port', process.env.PORT || 3000)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()

export default server