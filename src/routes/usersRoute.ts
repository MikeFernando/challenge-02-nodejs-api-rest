import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import z from 'zod'

import { knex } from '../database'

export async function usersRoute(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      image_url: z.string(),
    })

    let { sessionId } = req.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7days
      })
    }

    const { image_url } = createUserBodySchema.parse(req.body)

    await knex('users').insert({
      id: randomUUID(),
      image_url,
      session_id: sessionId,
    })

    return res.status(201).send()
  })
}
