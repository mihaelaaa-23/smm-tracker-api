import pool from '../db.js'
import { requirePermission } from '../middleware/auth.js'

const TaskSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    clientId: { type: 'integer' },
    title: { type: 'string' },
    type: { type: 'string' },
    deadline: { type: 'string' },
    status: { type: 'string' },
    priority: { type: 'string' },
    description: { type: 'string' },
    needsApproval: { type: 'boolean' },
    createdAt: { type: 'string' },
  }
}

export default async function taskRoutes(server) {

  // GET /tasks
  server.get('/tasks', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Tasks'],
      summary: 'Get all tasks',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
          clientId: { type: 'integer' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: TaskSchema },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          }
        }
      }
    }
  }, async (request) => {
    const { limit = 10, offset = 0, clientId, status, priority } = request.query
    const conditions = []
    const params = []

    if (clientId) { conditions.push(`"clientId" = $${params.length + 1}`); params.push(clientId) }
    if (status) { conditions.push(`status = $${params.length + 1}`); params.push(status) }
    if (priority) { conditions.push(`priority = $${params.length + 1}`); params.push(priority) }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
    const { rows: data } = await pool.query(
      `SELECT * FROM tasks${where} ORDER BY deadline ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    )
    const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) as count FROM tasks${where}`, params)

    return { data, total: parseInt(count), limit, offset }
  })

  // GET /tasks/:id
  server.get('/tasks/:id', {
    preHandler: requirePermission('READ'),
    schema: {
      tags: ['Tasks'],
      summary: 'Get task by ID',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: {
        200: TaskSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [request.params.id])
    if (!rows[0]) return reply.code(404).send({ error: 'Task not found' })
    return rows[0]
  })

  // POST /tasks
  server.post('/tasks', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Tasks'],
      summary: 'Create task',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['clientId', 'title', 'deadline'],
        properties: {
          clientId: { type: 'integer' },
          title: { type: 'string' },
          type: { type: 'string', enum: ['post', 'story', 'reel', 'content-plan', 'other'], default: 'post' },
          deadline: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'], default: 'todo' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
          description: { type: 'string', default: '' },
          needsApproval: { type: 'boolean', default: false },
        }
      },
      response: { 201: TaskSchema }
    }
  }, async (request, reply) => {
    const { clientId, title, type = 'post', deadline, status = 'todo', priority = 'medium', description = '', needsApproval = false } = request.body

    const { rows: client } = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId])
    if (!client[0]) return reply.code(404).send({ error: 'Client not found' })

    const { rows } = await pool.query(
      `INSERT INTO tasks ("clientId", title, type, deadline, status, priority, description, "needsApproval") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [clientId, title, type, deadline, status, priority, description, needsApproval]
    )
    return reply.code(201).send(rows[0])
  })

  // PUT /tasks/:id
  server.put('/tasks/:id', {
    preHandler: requirePermission('WRITE'),
    schema: {
      tags: ['Tasks'],
      summary: 'Update task',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          type: { type: 'string', enum: ['post', 'story', 'reel', 'content-plan', 'other'] },
          deadline: { type: 'string' },
          status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          description: { type: 'string' },
          needsApproval: { type: 'boolean' },
        }
      },
      response: {
        200: TaskSchema,
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows: existing } = await pool.query('SELECT * FROM tasks WHERE id = $1', [request.params.id])
    if (!existing[0]) return reply.code(404).send({ error: 'Task not found' })

    const { title, type, deadline, status, priority, description, needsApproval } = request.body
    const { rows } = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        deadline = COALESCE($3, deadline),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        description = COALESCE($6, description),
        "needsApproval" = COALESCE($7, "needsApproval")
      WHERE id = $8 RETURNING *`,
      [title, type, deadline, status, priority, description, needsApproval, request.params.id]
    )
    return rows[0]
  })

  // DELETE /tasks/:id
  server.delete('/tasks/:id', {
    preHandler: requirePermission('DELETE'),
    schema: {
      tags: ['Tasks'],
      summary: 'Delete task',
      security: [{ bearerAuth: [] }],
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const { rows } = await pool.query('SELECT id FROM tasks WHERE id = $1', [request.params.id])
    if (!rows[0]) return reply.code(404).send({ error: 'Task not found' })
    await pool.query('DELETE FROM tasks WHERE id = $1', [request.params.id])
    return { message: 'Task deleted successfully' }
  })
}