import pool from '../db.js'
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
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
          status: { type: 'string', enum: ['active', 'inactive'] },
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
    const conditions = []
    const params = []

    if (status) { conditions.push(`status = $${params.length + 1}`); params.push(status) }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
    const { rows: data } = await pool.query(`SELECT * FROM clients${where} ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset])
    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) as count FROM clients${where}`, params)

    return { data, total: parseInt(count), limit, offset }
  })

  // GET /clients/:id
  server.get('/clients/:id', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Clients'],
      summary: 'Get client by ID',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: {
        200: ClientSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [request.params.id])
    if (!rows[0]) return reply.code(404).send({ error: 'Client not found' })
    return rows[0]
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
      response: { 201: ClientSchema }
    }
  }, async (request, reply) => {
    const { name, brand, platforms = [], status = 'active', priority = false, notes = '' } = request.body
    const { rows } = await pool.query(
      `INSERT INTO clients (name, brand, platforms, status, priority, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, brand, JSON.stringify(platforms), status, priority, notes]
    )
    return reply.code(201).send(rows[0])
  })

  // PUT /clients/:id
  server.put('/clients/:id', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Clients'],
      summary: 'Update client',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
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
    const { rows: existing } = await pool.query('SELECT * FROM clients WHERE id = $1', [request.params.id])
    if (!existing[0]) return reply.code(404).send({ error: 'Client not found' })

    const { name, brand, platforms, status, priority, notes } = request.body
    const { rows } = await pool.query(
      `UPDATE clients SET
        name = COALESCE($1, name),
        brand = COALESCE($2, brand),
        platforms = COALESCE($3, platforms),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        notes = COALESCE($6, notes)
      WHERE id = $7 RETURNING *`,
      [name, brand, platforms ? JSON.stringify(platforms) : null, status, priority, notes, request.params.id]
    )
    return rows[0]
  })

  // DELETE /clients/:id
  server.delete('/clients/:id', {
    preHandler: requirePermission('DELETE'),
    schema: {
      tags: ['Clients'],
      summary: 'Delete client',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows } = await pool.query('SELECT id FROM clients WHERE id = $1', [request.params.id])
    if (!rows[0]) return reply.code(404).send({ error: 'Client not found' })
    await pool.query('DELETE FROM clients WHERE id = $1', [request.params.id])
    return { message: 'Client deleted successfully' }
  })
}