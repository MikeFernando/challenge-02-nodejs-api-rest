import { FastifyReply, FastifyRequest } from 'fastify'

export async function CheckSessionIdExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({
      error: 'Unauthorized',
    })
  }
}
