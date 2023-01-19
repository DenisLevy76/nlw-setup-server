import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'
import { date, z } from 'zod'
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

  server.patch('/habits/:habitId/toggle', async (request, response) => {
    const toggleHabitParams = z.object({
      habitId: z.string().uuid()
    })

    try {
      const { habitId } = toggleHabitParams.parse(request.params)
      const today = dayjs().startOf('day').toDate()
      let day = await prisma.day.findUnique({
        where: {
          date: today
        }
      })

      if (!day) {
        day = await prisma.day.create({
          data: {
            date: today
          }
        })
      }

      // verificando se o hábito já havia sido completado
      const dayHabit = await prisma.dayHabit.findUnique({
        where: {
          dayId_habitId: {
            dayId: day.id,
            habitId
          }
        }
      })

      if (dayHabit) {
        await prisma.dayHabit.delete({
          where: {
            id: dayHabit.id
          }
        })
      } else {
        // completar habito
        await prisma.dayHabit.create({
          data: {
            dayId: day.id,
            habitId,
          }
        })
      }

    } catch (error) {
      console.error(error)
    }


  })

  server.get('/summary', async () => {
    const summary = await prisma.$queryRaw`
      SELECT 
        D.id, 
        D.date,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.dayId = D.id
        ) as completed,
        (
          SELECT
            cast(count(*) as float)
          FROM habit_week_days HDW
          JOIN habits H
            ON H.id = HDW.habitId
          WHERE
            HDW.weekDay = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.createdAt <= D.date
        ) as amount
      FROM days D
    `

    return summary
  })
}