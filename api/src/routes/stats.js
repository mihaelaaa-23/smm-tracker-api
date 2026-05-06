import pool from '../db.js'
import { authenticate } from '../middleware/auth.js'

export default async function statsRoutes(server) {
    server.get('/stats', {
        onRequest: [authenticate],
        schema: {
            tags: ['Stats'],
            summary: 'Get dashboard stats',
            description: 'Returns aggregated stats. Accessible to all roles including VIEWER.',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        totalClients: { type: 'integer' },
                        activeClients: { type: 'integer' },
                        totalTasks: { type: 'integer' },
                        pendingTasks: { type: 'integer' },
                        totalPayments: { type: 'integer' },
                        totalRevenue: { type: 'number' },
                        unpaidCount: { type: 'integer' },
                    }
                }
            }
        }
    }, async (request, reply) => {
        const [clients, tasks, payments] = await Promise.all([
            pool.query('SELECT status FROM clients'),
            pool.query('SELECT status FROM tasks'),
            pool.query('SELECT status, amount FROM payments'),
        ])

        const totalClients = clients.rows.length
        const activeClients = clients.rows.filter(c => c.status === 'active').length
        const totalTasks = tasks.rows.length
        const pendingTasks = tasks.rows.filter(t => t.status !== 'done').length
        const totalPayments = payments.rows.length
        const totalRevenue = payments.rows.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0)
        const unpaidCount = payments.rows.filter(p => p.status === 'unpaid').length

        return reply.send({
            totalClients,
            activeClients,
            totalTasks,
            pendingTasks,
            totalPayments,
            totalRevenue,
            unpaidCount,
        })
    })
}