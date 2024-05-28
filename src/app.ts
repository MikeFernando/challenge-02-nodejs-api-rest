import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { usersRoute } from './routes/usersRoute'
import { mealsRoute } from './routes/melsRotue'

export const app = fastify()

app.register(cookie)
app.register(usersRoute, { prefix: 'users' })
app.register(mealsRoute, { prefix: 'meals' })
