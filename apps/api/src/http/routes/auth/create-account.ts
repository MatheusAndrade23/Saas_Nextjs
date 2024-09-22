import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { hash } from 'bcryptjs'

import { prisma } from '@/lib/prisma'

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

type CreateUserBody = z.infer<typeof createUserBodySchema>

export async function createAccount(app: FastifyInstance) {
  app.post<{ Body: CreateUserBody }>(
    '/users',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail) {
        return reply.status(400).send({
          message: 'User with same email already exists',
        })
      }

      const passwordHash = await hash(password, 6)

      prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      })

      return reply.status(201).send({
        message: 'User created',
      })
    }
  )
}
