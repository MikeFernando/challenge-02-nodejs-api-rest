import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import z from 'zod'

import { knex } from '../database'

import { CheckSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoute(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      within_the_diet: z.number(),
    })

    let { sessionId } = req.cookies

    if (!sessionId) {
      sessionId = randomUUID()

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7days
      })
    }

    const { name, description, within_the_diet } = createMealBodySchema.parse(
      req.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      within_the_diet,
    })

    return res.status(201).send()
  })

  app.get('/', { preHandler: CheckSessionIdExists }, async (_, res) => {
    const meals = await knex('meals').select()

    return res.status(200).send(meals)
  })

  app.get('/metrics', { preHandler: CheckSessionIdExists }, async (_, res) => {
    const allMeals = await knex('meals').select()

    const total = allMeals.length

    const totalWithin = allMeals.filter(
      (meal) => meal.within_the_diet === 1,
    ).length

    const totalOutside = allMeals.filter(
      (meal) => meal.within_the_diet === 0,
    ).length

    let maxSequence = []
    let currentSequence = []

    // 0 = outside_the_diet
    // 1 = within_the_diet
    allMeals.forEach((meal) => {
      if (meal.within_the_diet === 1) {
        currentSequence.push(meal)
        if (currentSequence.length > maxSequence.length) {
          maxSequence = [...currentSequence]
        }
      } else {
        currentSequence = []
      }
    })

    const metrics = {
      total,
      totalWithin,
      totalOutside,
      dietMaxSequence: maxSequence.length,
    }

    return res.status(200).send({ metrics })
  })

  app.get('/:id', { preHandler: CheckSessionIdExists }, async (req, res) => {
    const getParamsIdSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getParamsIdSchema.parse(req.params)

    const meal = await knex('meals').where('id', id).select()

    return res.status(200).send({ meal })
  })

  app.put('/:id', { preHandler: CheckSessionIdExists }, async (req, res) => {
    const getParamsIdSchema = z.object({
      id: z.string().uuid(),
    })

    const updateMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      within_the_diet: z.number(),
    })

    const { name, description, within_the_diet } = updateMealSchema.parse(
      req.body,
    )
    const { id } = getParamsIdSchema.parse(req.params)

    await knex('meals').where('id', id).update({
      name,
      description,
      within_the_diet,
    })

    return res.status(204).send()
  })

  app.delete('/:id', { preHandler: CheckSessionIdExists }, async (req, res) => {
    const getParamsIdSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getParamsIdSchema.parse(req.params)

    await knex('meals').where('id', id).del()

    return res.status(200).send()
  })
}
