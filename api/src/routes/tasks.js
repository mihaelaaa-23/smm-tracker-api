import db from '../db.js'
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
          clientId: { type: 'integer', description: 'Filter by client' },
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

    if (clientId) { conditions.push('clientId = ?'); params.push(clientId) }
    if (status) { conditions.push('status = ?'); params.push(status) }
    if (priority) { conditions.push('priority = ?'); params.push(priority) }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
    const data = db.prepare(`SELECT * FROM tasks${where} ORDER BY deadline ASC LIMIT ? OFFSET ?`).all(...params, limit, offset)
    const { total } = db.prepare(`SELECT COUNT(*) as total FROM tasks${where}`).get(...params)

    return {
      data: data.map(t => ({ ...t, needsApproval: Boolean(t.needsApproval) })),
      total, limit, offset
    }
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
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(request.params.id)
    if (!task) return reply.code(404).send({ error: 'Task not found' })
    return { ...task, needsApproval: Boolean(task.needsApproval) }
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

    const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(clientId)
    if (!client) return reply.code(404).send({ error: 'Client not found' })

    const result = db.prepare(
      'INSERT INTO tasks (clientId, title, type, deadline, status, priority, description, needsApproval) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(clientId, title, type, deadline, status, priority, description, needsApproval ? 1 : 0)

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    return reply.code(201).send({ ...task, needsApproval: Boolean(task.needsApproval) })
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
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(request.params.id)
    if (!existing) return reply.code(404).send({ error: 'Task not found' })

    const { title, type, deadline, status, priority, description, needsApproval } = request.body
    db.prepare(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        type = COALESCE(?, type),
        deadline = COALESCE(?, deadline),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        description = COALESCE(?, description),
        needsApproval = COALESCE(?, needsApproval)
      WHERE id = ?
    `).run(title, type, deadline, status, priority, description, needsApproval !== undefined ? (needsApproval ? 1 : 0) : null, request.params.id)

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(request.params.id)
    return { ...task, needsApproval: Boolean(task.needsApproval) }
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
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(request.params.id)
    if (!existing) return reply.code(404).send({ error: 'Task not found' })

    db.prepare('DELETE FROM tasks WHERE id = ?').run(request.params.id)
    return { message: 'Task deleted successfully' }
  })
}