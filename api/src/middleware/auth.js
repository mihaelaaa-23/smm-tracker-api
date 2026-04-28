export const authenticate = async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized — invalid or expired token' })
  }
}

export const requirePermission = (permission) => async (request, reply) => {
  try {
    await request.jwtVerify()
    const { permissions } = request.user
    if (!permissions.includes(permission)) {
      reply.code(403).send({ error: `Forbidden — requires ${permission} permission` })
    }
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized — invalid or expired token' })
  }
}