
import { authenticate, hasAccess } from '../authenticate.js'
import db from '../../../db/models/index.js'
import { Op } from 'sequelize'

const { Play, Resonate: sequelize, Track } = db

export default () => {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET]
  }

  async function GET (ctx, next) {
    const {
      from,
      to
    } = ctx.request.query

    const currentDate = to ? new Date(to) : new Date()
    const endDate = currentDate.setHours(23, 59, 59, 999)
    const lastYear = from ? new Date(from) : new Date(currentDate.getTime())
    lastYear.setFullYear(currentDate.getFullYear() - 1)
    const startDate = lastYear.setHours(0, 0, 0, 0)

    try {
      const res = await Play.findAll({
        attributes: [
          [sequelize.literal('DATE("Play"."created_at")'), 'date'],
          [sequelize.literal('COUNT(*)'), 'count']
        ],
        where: {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        group: ['"Play"."created_at"', 'track.id'],
        order: [['count', 'DESC']],
        include: [{
          model: Track,
          attributes: ['id'],
          as: 'track',
          where: {
            creatorId: ctx.request.query.creatorId
          }
        }]
      })

      ctx.body = {
        data: res
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUserStats',
    description: 'Returns user stats',
    tags: ['plays'],
    parameters: [
      {
        in: 'query',
        name: 'from',
        type: 'string',
        format: 'date'
      },
      {
        in: 'query',
        name: 'creatorId',
        required: true,
        type: 'string',
        format: 'uuid'
      },
      {
        in: 'query',
        name: 'to',
        type: 'string',
        format: 'date'
      },
      {
        in: 'query',
        name: 'period',
        type: 'string'
      }
    ],
    responses: {
      200: {
        description: 'The requested user stats.',
        schema: {
          type: 'object'
        }
      },
      404: {
        description: 'No results were found.'
      }
    }
  }

  return operations
}
