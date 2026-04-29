import pool from '../db.js'
import { requirePermission } from '../middleware/auth.js'

const PaymentSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    clientId: { type: 'integer' },
    amount: { type: 'number' },
    currency: { type: 'string' },
    month: { type: 'integer' },
    year: { type: 'integer' },
    status: { type: 'string' },
    date: { type: 'string' },
    notes: { type: 'string' },
  }
}

export default async function paymentRoutes(server) {

  // GET /payments
  server.get('/payments', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Payments'],
      summary: 'Get all payments',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
          clientId: { type: 'integer' },
          status: { type: 'string', enum: ['paid', 'unpaid', 'partial'] },
          currency: { type: 'string', enum: ['MDL', 'USD'] },
          month: { type: 'integer' },
          year: { type: 'integer' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: PaymentSchema },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          }
        }
      }
    }
  }, async (request) => {
    const { limit = 10, offset = 0, clientId, status, currency, month, year } = request.query
    const conditions = []
    const params = []

    if (clientId) { conditions.push(`"clientId" = $${params.length + 1}`); params.push(clientId) }
    if (status) { conditions.push(`status = $${params.length + 1}`); params.push(status) }
    if (currency) { conditions.push(`currency = $${params.length + 1}`); params.push(currency) }
    if (month) { conditions.push(`month = $${params.length + 1}`); params.push(month) }
    if (year) { conditions.push(`year = $${params.length + 1}`); params.push(year) }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
    const { rows: data } = await pool.query(
      `SELECT * FROM payments${where} ORDER BY year DESC, month DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    )
    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) as count FROM payments${where}`, params)

    return { data, total: parseInt(count), limit, offset }
  })

  // GET /payments/:id
  server.get('/payments/:id', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Payments'],
      summary: 'Get payment by ID',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: {
        200: PaymentSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows } = await pool.query('SELECT * FROM payments WHERE id = $1', [request.params.id])
    if (!rows[0]) return reply.code(404).send({ error: 'Payment not found' })
    return rows[0]
  })

  // POST /payments
  server.post('/payments', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Payments'],
      summary: 'Create payment',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['clientId', 'amount', 'month', 'year', 'date'],
        properties: {
          clientId: { type: 'integer' },
          amount: { type: 'number' },
          currency: { type: 'string', enum: ['MDL', 'USD'], default: 'MDL' },
          month: { type: 'integer', minimum: 1, maximum: 12 },
          year: { type: 'integer' },
          status: { type: 'string', enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
          date: { type: 'string' },
          notes: { type: 'string', default: '' },
        }
      },
      response: { 201: PaymentSchema }
    }
  }, async (request, reply) => {
    const { clientId, amount, currency = 'MDL', month, year, status = 'unpaid', date, notes = '' } = request.body

    const { rows: client } = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId])
    if (!client[0]) return reply.code(404).send({ error: 'Client not found' })

    const { rows } = await pool.query(
      `INSERT INTO payments ("clientId", amount, currency, month, year, status, date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [clientId, amount, currency, month, year, status, date, notes]
    )
    return reply.code(201).send(rows[0])
  })

  // PUT /payments/:id
  server.put('/payments/:id', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Payments'],
      summary: 'Update payment',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
          currency: { type: 'string', enum: ['MDL', 'USD'] },
          month: { type: 'integer', minimum: 1, maximum: 12 },
          year: { type: 'integer' },
          status: { type: 'string', enum: ['paid', 'unpaid', 'partial'] },
          date: { type: 'string' },
          notes: { type: 'string' },
        }
      },
      response: {
        200: PaymentSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows: existing } = await pool.query('SELECT * FROM payments WHERE id = $1', [request.params.id])
    if (!existing[0]) return reply.code(404).send({ error: 'Payment not found' })

    const { amount, currency, month, year, status, date, notes } = request.body
    const { rows } = await pool.query(
      `UPDATE payments SET
        amount = COALESCE($1, amount),
        currency = COALESCE($2, currency),
        month = COALESCE($3, month),
        year = COALESCE($4, year),
        status = COALESCE($5, status),
        date = COALESCE($6, date),
        notes = COALESCE($7, notes)
      WHERE id = $8 RETURNING *`,
      [amount, currency, month, year, status, date, notes, request.params.id]
    )
    return rows[0]
  })

  // DELETE /payments/:id
  server.delete('/payments/:id', {
    preHandler: requirePermission('DELETE'),
    schema: {
      tags: ['Payments'],
      summary: 'Delete payment',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows } = await pool.query('SELECT id FROM payments WHERE id = $1', [request.params.id])
    if (!rows[0]) return reply.code(404).send({ error: 'Payment not found' })
    await pool.query('DELETE FROM payments WHERE id = $1', [request.params.id])
    return { message: 'Payment deleted successfully' }
  })
}