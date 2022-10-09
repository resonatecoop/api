const { Resonate: sequelize, Play } = require('../../db/models')
const { Op } = require('sequelize')

/**
 * @description For a given member, get play count history per day from date range
 * @param {Number} uid Member id
 * @param {String} startDate ISO 8601 date format (ex: 2019-09-01)
 * @param {String} endDate ISO 8601 date format (ex: 2019-10-01)
 * @returns {Array} ISO date for play count
 */

module.exports.findAllPlayCounts = async (creatorId, startDate, endDate, format = '%Y-%m', type = 'paid', isLabel) => {
  if (!creatorId) throw new Error('Creator id is required')

  if (typeof startDate !== 'string') throw new Error('Start date is invalid')

  if (typeof endDate !== 'string') throw new Error('End date is invalid')

  console.log('inside find all play counts. creatorId: ', creatorId)
  console.log('isLabel: ', isLabel)

  // creatorId is 71175a23-9256-41c9-b8c1-cd2170aa6591

  // const subQuery = sequelize.dialect.QueryGenerator.selectQuery('tracks', {
  //   attributes: ['tid'],
  //   where: {
  //     uid: creatorId
  //   }
  // }).slice(0, -1)

  const subQuery = sequelize.dialect.QueryGenerator.selectQuery('tracks', {
    attributes: ['id'],
    where: {
      creator_id: creatorId
    }
  })

  // const subQuery = null

  console.log('after subQuery ', subQuery)

  const event = ['free', 'paid'].indexOf(type)

  const queryOptions = {
    attributes: [
      [sequelize.fn('FROM_UNIXTIME', sequelize.col('date'), format), 'd'],
      [sequelize.fn('IF', [sequelize.fn('count', sequelize.col('pid')), 'count'] > 8, 9, sequelize.fn('count', sequelize.col('pid'))), 'count']
    ],
    where: {
      tid: {
        [Op.in]: sequelize.literal('(' + subQuery + ')')
      },
      uid: {
        [Op.ne]: creatorId
      },
      event: event,
      date: {
        [Op.and]: {
          [Op.gt]: sequelize.fn('UNIX_TIMESTAMP', startDate),
          [Op.lt]: sequelize.fn('UNIX_TIMESTAMP', endDate)
        }
      }
    },
    group: [
      sequelize.fn('FROM_UNIXTIME', sequelize.col('date'), format)
    ],
    order: [
      [[sequelize.literal('d'), 'desc']]
    ],
    raw: true
  }

  if (isLabel) {
    const subQueryLabel = sequelize.dialect.QueryGenerator.selectQuery('rsntr_usermeta', {
      attributes: ['user_id'],
      where: {
        meta_key: 'mylabel',
        meta_value: creatorId
      }
    }).slice(0, -1)

    // const subQuery = sequelize.dialect.QueryGenerator.selectQuery('tracks', {
    //   attributes: ['tid'],
    //   where: {
    //     uid: {
    //       [Op.in]: sequelize.literal('(' + subQueryLabel + ')')
    //     }
    //   }
    // }).slice(0, -1)

    const subQuery = sequelize.dialect.QueryGenerator.selectQuery('tracks', {
      attributes: ['id'],
      where: {
        creator_id: {
          [Op.in]: sequelize.literal('(' + subQueryLabel + ')')
        }
      }
    }).slice(0, -1)

    // queryOptions.where.tid = {
    //   [Op.in]: sequelize.literal('(' + subQuery + ')')
    // }
    queryOptions.where.id = {
      [Op.in]: sequelize.literal('(' + subQuery + ')')
    }
  }

  console.log('queryOptions: ', queryOptions)

  const result = await Play.findAll(queryOptions)

  console.log('plays line 98 result: ', result)

  return result.map(item => ({ date: item.d, plays: item.count }))
}
