export default async function authRoutes(server) {
  server.post('/token', {
    schema: {
      tags: ['Auth'],
      summary: 'Generate JWT token',
      description: 'Returns a JWT token with role and permissions. Token expires in 1 minute.',
      body: {
        type: 'object',
        required: ['role'],
        properties: {
          role: {
            type: 'string',
            enum: ['ADMIN', 'WRITER', 'VISITOR'],
            description: 'ADMIN: full access, WRITER: read+write, VISITOR: read only'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            role: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            expiresIn: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { role } = request.body

    const permissions = {
      ADMIN: ['READ', 'WRITE', 'DELETE'],
      WRITER: ['READ', 'WRITE'],
      VISITOR: ['READ'],
    }

    const token = server.jwt.sign(
      { role, permissions: permissions[role] },
      { expiresIn: '1m' }
    )

    return reply.send({
      token,
      role,
      permissions: permissions[role],
      expiresIn: '1 minute'
    })
  })
}