import db from '../db.js'
import { requirePermission } from '../middleware/auth.js'

const ClientSchema = {
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

export default async function clientRoutes(server) {

  // GET /clients
  server.get('/clients', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Clients'],
      summary: 'Get all clients',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 10, description: 'Number of items to return' },
          offset: { type: 'integer', default: 0, description: 'Number of items to skip' },
          status: { type: 'string', enum: ['active', 'inactive'], description: 'Filter by status' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: ClientSchema },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          }
        }
      }
    }
  }, async (request) => {
    const { limit = 10, offset = 0, status } = request.query

    let query = 'SELECT * FROM clients'
    let countQuery = 'SELECT COUNT(*) as total FROM clients'
    const params = []

    if (status) {
      query += ' WHERE status = ?'
      countQuery += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'

    const data = db.prepare(query).all(...params, limit, offset)
    const { total } = db.prepare(countQuery).get(...params)

    return {
      data: data.map(c => ({ ...c, platforms: JSON.parse(c.platforms), priority: Boolean(c.priority) })),
      total,
      limit,
      offset
    }
  })

  // GET /clients/:id
  server.get('/clients/:id', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Clients'],
      summary: 'Get client by ID',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      },
      response: {
        200: ClientSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(request.params.id)
    if (!client) return reply.code(404).send({ error: 'Client not found' })
    return { ...client, platforms: JSON.parse(client.platforms), priority: Boolean(client.priority) }
  })

  // POST /clients
  server.post('/clients', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Clients'],
      summary: 'Create client',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'brand'],
        properties: {
          name: { type: 'string' },
          brand: { type: 'string' },
          platforms: { type: 'array', items: { type: 'string' }, default: [] },
          status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
          priority: { type: 'boolean', default: false },
          notes: { type: 'string', default: '' },
        }
      },
      response: {
        201: ClientSchema
      }
    }
  }, async (request, reply) => {
    const { name, brand, platforms = [], status = 'active', priority = false, notes = '' } = request.body
    const result = db.prepare(
      'INSERT INTO clients (name, brand, platforms, status, priority, notes) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, brand, JSON.stringify(platforms), status, priority ? 1 : 0, notes)

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid)
    return reply.code(201).send({ ...client, platforms: JSON.parse(client.platforms), priority: Boolean(client.priority) })
  })

  // PUT /clients/:id
  server.put('/clients/:id', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Clients'],
      summary: 'Update client',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          brand: { type: 'string' },
          platforms: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['active', 'inactive'] },
          priority: { type: 'boolean' },
          notes: { type: 'string' },
        }
      },
      response: {
        200: ClientSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(request.params.id)
    if (!existing) return reply.code(404).send({ error: 'Client not found' })

    const { name, brand, platforms, status, priority, notes } = request.body
    db.prepare(`
      UPDATE clients SET
        name = COALESCE(?, name),
        brand = COALESCE(?, brand),
        platforms = COALESCE(?, platforms),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(name, brand, platforms ? JSON.stringify(platforms) : null, status, priority !== undefined ? (priority ? 1 : 0) : null, notes, request.params.id)

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(request.params.id)
    return { ...client, platforms: JSON.parse(client.platforms), priority: Boolean(client.priority) }
  })

  // DELETE /clients/:id
  server.delete('/clients/:id', {
    preHandler: requirePermission('DELETE'),
    schema: {
      tags: ['Clients'],
      summary: 'Delete client',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: { id: { type: 'integer' } }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(request.params.id)
    if (!existing) return reply.code(404).send({ error: 'Client not found' })

    db.prepare('DELETE FROM clients WHERE id = ?').run(request.params.id)
    return { message: 'Client deleted successfully' }
  })
}