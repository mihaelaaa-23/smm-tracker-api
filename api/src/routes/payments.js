import db from '../db.js'
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
          clientId: { type: 'integer', description: 'Filter by client' },
          status: { type: 'string', enum: ['paid', 'unpaid', 'partial'] },
          currency: { type: 'string', enum: ['MDL', 'USD'] },
          month: { type: 'integer', description: 'Filter by month (1-12)' },
          year: { type: 'integer', description: 'Filter by year' },
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

    if (clientId) { conditions.push('clientId = ?'); params.push(clientId) }
    if (status) { conditions.push('status = ?'); params.push(status) }
    if (currency) { conditions.push('currency = ?'); params.push(currency) }
    if (month) { conditions.push('month = ?'); params.push(month) }
    if (year) { conditions.push('year = ?'); params.push(year) }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
    const data = db.prepare(`SELECT * FROM payments${where} ORDER BY year DESC, month DESC LIMIT ? OFFSET ?`).all(...params, limit, offset)
    const { total } = db.prepare(`SELECT COUNT(*) as total FROM payments${where}`).get(...params)

    return { data, total, limit, offset }
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
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(request.params.id)
    if (!payment) return reply.code(404).send({ error: 'Payment not found' })
    return payment
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

    const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(clientId)
    if (!client) return reply.code(404).send({ error: 'Client not found' })

    const result = db.prepare(
      'INSERT INTO payments (clientId, amount, currency, month, year, status, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(clientId, amount, currency, month, year, status, date, notes)

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid)
    return reply.code(201).send(payment)
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
    const existing = db.prepare('SELECT * FROM payments WHERE id = ?').get(request.params.id)
    if (!existing) return reply.code(404).send({ error: 'Payment not found' })

    const { amount, currency, month, year, status, date, notes } = request.body
    db.prepare(`
      UPDATE payments SET
        amount = COALESCE(?, amount),
        currency = COALESCE(?, currency),
        month = COALESCE(?, month),
        year = COALESCE(?, year),
        status = COALESCE(?, status),
        date = COALESCE(?, date),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(amount, currency, month, year, status, date, notes, request.params.id)

    return db.prepare('SELECT * FROM payments WHERE id = ?').get(request.params.id)
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
    const existing = db.prepare('SELECT * FROM payments WHERE id = ?').get(request.params.id)
    if (!existing) return reply.code(404).send({ error: 'Payment not found' })

    db.prepare('DELETE FROM payments WHERE id = ?').run(request.params.id)
    return { message: 'Payment deleted successfully' }
  })
}