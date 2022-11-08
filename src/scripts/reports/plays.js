const { Resonate: sequelize, Play } = require('../../db/models')
const { Op } = require('sequelize')

/**
 * @description For a given member, get play count history per day from date range
 * @param {Number} uid Member id
 * @param {String} startDate ISO 8601 date format (ex: 2019-09-01)
 * @param {String} endDate ISO 8601 date format (ex: 2019-10-01)
 * @returns {Array} ISO date for play count
 */

module.exports.findAllPlayCounts = async (creatorId, startDate, endDate, format = '%Y-%m', type = 'paid') => {
  if (!creatorId) throw new Error('Creator id is required')

  if (typeof startDate !== 'string') throw new Error('Start date is invalid')

  if (typeof endDate !== 'string') throw new Error('End date is invalid')

  console.log('inside find all play counts. creatorId: ', creatorId)

  const subQuery = sequelize.dialect.queryGenerator.selectQuery('tracks', {
    attributes: ['id'],
    where: {
      creatorId
    }
  })

  console.log('after subQuery ', subQuery.replace(';', ''))

  const event = ['free', 'paid'].indexOf(type)

  const queryOptions = {
    attributes: [
      [sequelize.literal('DATE("created_at")'), 'date'],
      [sequelize.fn('IF', [sequelize.fn('count', sequelize.col('id')), 'count'] > 8, 9, sequelize.fn('count', sequelize.col('id'))), 'count']
    ],
    where: {
      trackId: {
        [Op.in]: sequelize.literal('(' + subQuery.replace(';', '') + ')')
      },
      userId: {
        [Op.ne]: creatorId
      },
      event: event,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    group: ['createdAt'],
    order: [
      [[sequelize.literal('createdAt'), 'desc']]
    ],
    raw: true
  }

  console.log('queryOptions: ', queryOptions)

  const result = await Play.findAll(queryOptions)

  console.log('plays line 98 result: ', result)

  return result.map(item => ({ date: item.d, plays: item.count }))
}
