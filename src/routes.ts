import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from './lib/prisma'

export const routes = async (server: FastifyInstance) => {
  server.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    })

    const { title, weekDays } = createHabitBody.parse(request.body)
    const today = dayjs().startOf('day').toDate()
    const habit = prisma.habit.create({
      data: {
        title,
        createdAt: today,
        habitWeekDay: {
          create: weekDays.map(weekDay => ({
            weekDay
          }))
        }
      }
    })

    return habit
  })

  server.get('/habit', async (request) => {

    const getDayParams = z.object({
      day: z.coerce.date()
    })

    const { day } = getDayParams.parse(request.query)

    const parsedDate = dayjs(day).startOf('day')
    const targetWeekDay = parsedDate.get('day')

    const possibleHabits = await prisma.habit.findMany({
      where: {
        createdAt: {
          lte: day
        },
        habitWeekDay: {
          some: {
            weekDay: targetWeekDay
          }
        }
      }
    })

    const dayTarget = await prisma.day.findUnique({
      where: {
        date: day
      },
      include: {
        dayHabits: true
      }
    })

    const completedHabits = dayTarget?.dayHabits.map(habit => habit.habitId)

    return {
      possibleHabits,
      completedHabits
    }
  })
}