
const { Op } = require('sequelize')
const { User, Role, UserMembership, Resonate: sequelize, UserGroup, TrackGroup, Track } = require('../../../../db/models')
const { authenticate, hasAccess } = require('../../authenticate')
const { createObjectCsvStringifier } = require('csv-writer')

module.exports = function () {
  const operations = {
    GET: [authenticate, hasAccess('admin'), GET]
  }

  async function GET (ctx, next) {
    const {
      format,
      limit = !format ? 20 : undefined,
      page = !format ? 1 : undefined,
      q,
      members
    } = ctx.request.query

    try {
      const attributes = ['id', 'displayName', 'email', 'emailConfirmed', 'country', 'fullName', 'member', 'updatedAt']

      const group = []
      let having
      const where = {
        [Op.and]: []
      }

      if (q) {
        where[Op.and].push({
          [Op.or]:
          [{ displayName: { [Op.iLike]: `%${q}%` } }, { email: { [Op.iLike]: `%${q}%` } }]
        })
      }

      if (members) {
        // attributes.push(
        //   sequelize.literal('COUNT("user_groups"."id") AS "user_groups.count"'),
        //   sequelize.literal('COUNT("user_groups->tracks"."id") AS "user_groups->tracks.count"')
        // )
        where[Op.and].push({
          [Op.or]:
            [{
              [Op.and]: [
                sequelize.literal('"memberships"."membership_class_id" = 4'),
                sequelize.literal('"memberships"."updated_at" > NOW() - interval \'1 year\'')
              ]
            },
            {
              member: true
            }, {
              [Op.and]: [
                sequelize.literal('"user_groups->trackgroups"."enabled" = true'),
                sequelize.literal('"user_groups->trackgroups"."private" = false'),
                sequelize.literal('"user_groups->trackgroups"."release_date" > NOW() - interval \'2 year\'')
              ]
            }]
        })

        group.push(sequelize.col('"role.id"'), sequelize.col('"memberships"."id"'), sequelize.col('"user_groups"."id"'), sequelize.col('"User"."id"'))
        having = (sequelize.literal(`(COUNT("user_groups"."id") > 0 and COUNT("user_groups->tracks"."id") > 0)
          or ("memberships"."membership_class_id" = 4 AND "memberships"."updated_at" > NOW() - interval '1 year')
          or ("User"."member" = true)`))
      }

      const { rows, count } = await User.findAndCountAll({
        limit,
        attributes,
        order: [['displayName', 'asc']],
        where,
        offset: page > 1 ? (page - 1) * limit : 0,
        include: [
          {
            model: Role,
            as: 'role'
          },
          ...(members
            ? [
                {

                  model: UserMembership,
                  attributes: ['membershipClassId', 'updatedAt'],
                  as: 'memberships'
                }, {
                  model: UserGroup,
                  as: 'user_groups',
                  attributes: ['id'],
                  include: [{
                    model: TrackGroup,
                    attributes: [],
                    as: 'trackgroups'
                  }, {
                    model: Track,
                    attributes: [],
                    as: 'tracks'
                  }]
                }]
            : [])
        ],
        ...(having ? { having } : {}),
        group,
        subQuery: false
      })

      if (format === 'application/csv') {
        const csvGenerator = createObjectCsvStringifier({
          header: [...attributes, 'memberships.membership_class_id', 'created_at']
        })
        const records = csvGenerator.stringifyRecords(rows)
        ctx.type = 'application/csv'
        ctx.body = records
      } else {
        // FIXME: why is count values messed up here?
        let unwrappedCount = count?.[0]?.count ? count?.[0]?.count : count
        if (members) {
          unwrappedCount = count.length
        }
        ctx.body = {
          count: unwrappedCount,
          numberOfPages: Math.ceil(unwrappedCount / limit),
          data: rows,
          status: 'ok'
        }
      }
    } catch (err) {
      console.error(err)
      ctx.throw(500, err.message)
    }

    await next()
  }

  GET.apiDoc = {
    operationId: 'getUsersThroughAdmin',
    description: 'Returns all users',
    summary: 'Find users',
    tags: ['admin'],
    produces: [
      'application/json',
      'application/csv'
    ],
    responses: {
      400: {
        description: 'Bad request',
        schema: {
          $ref: '#/responses/BadRequest'
        }
      },
      404: {
        description: 'Not found',
        schema: {
          $ref: '#/responses/NotFound'
        }
      },
      default: {
        description: 'error payload',
        schema: {
          $ref: '#/definitions/Error'
        }
      }
    },
    parameters: [
      {
        description: 'The maximum number of results to return',
        in: 'query',
        name: 'limit',
        type: 'integer',
        maximum: 100
      },
      {
        description: 'Order',
        in: 'query',
        name: 'order',
        type: 'string',
        enum: ['random', 'oldest', 'newest']
      },
      {
        type: 'integer',
        description: 'The current page',
        in: 'query',
        name: 'page',
        minimum: 1
      },
      {
        type: 'boolean',
        description: 'Should filter by members or not',
        in: 'query',
        name: 'members'
      },
      {
        type: 'string',
        description: 'Return CSV or JSON. JSON by default',
        in: 'query',
        name: 'format',
        enum: ['application/csv', 'application/json']
      }
    ]
  }

  return operations
}
