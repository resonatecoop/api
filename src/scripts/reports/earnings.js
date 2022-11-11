const { Play, Track, UserGroupType, UserGroup, User } = require('../../db/models')
const { Op } = require('sequelize')
const { groupBy } = require('lodash')

/**
 * @param {String} startDate ISO 8601 date format (ex: 2019-09-01)
 * @param {String} endDate ISO 8601 date format (ex: 2019-10-01)
 * @param {Number} creatorId User id (artist or label)
 *
 * @description Report all artists earnings between two dates grouped by tracks
 * @returns {Array}
 */

const findOneArtistEarnings = async (startDate, endDate, creatorId) => {
  const user = await User.findOne({
    attributes: [
      'id',
      'email'
    ],
    where: {
      id: creatorId
    },
    include: [
      {
        model: UserGroup,
        as: 'userGroups',
        attributes: ['displayName'],
        required: true,
        include: [{
          model: UserGroupType,
          as: 'type'
        }, {
          model: Track,
          attributes: ['id', 'title'],
          as: 'tracks',
          include: [{
            model: Play,
            as: 'plays',
            where: {
              type: 1,
              createdAt: {
                [Op.between]: [startDate, endDate]
              }
            }
          }]
        }]
      }
    ]
  })

  // For each user group of this user
  const report = []
  const sums = user.userGroups.map(group => {
    const groupSums = {
      id: group.id,
      displayName: group.displayName,
      totalCredits: 0,
      artistTotalCredits: 0,
      artistTotalEuros: 0,
      resonateTotalCredits: 0,
      resonateTotalEuros: 0
    }
    group.tracks.forEach(t => {
      const track = {
        id: t.id,
        title: t.title,
        userGroup: group.displayName,
        paidPlays: 0,
        playsAfterBought: 0,
        creditsSpent: 0,
        eurosSpent: 0
      }

      const playsGroupedByListener = groupBy(t.plays, 'userId')
      Object.keys(playsGroupedByListener).forEach(listener => {
        const plays = playsGroupedByListener[listener]
        let toAdd = 0
        if (plays.length > 9) {
          toAdd = 9
          track.playsAfterBought += plays.length - toAdd
        } else {
          toAdd = plays.length
        }
        track.paidPlays += toAdd

        // Do the math to convert that number of plays to credits
        let creditsForUser = 0
        for (let i = 1; i <= toAdd; i++) {
          creditsForUser += Math.pow(2, i)
        }
        track.creditsSpent += creditsForUser
      })
      // Do the math to convert that number of credits to euros
      track.eurosSpent += track.creditsSpent / 1000 * 1.25

      groupSums.totalCredits += track.creditsSpent
      report.push(track)
    })

    // FIXME this probably needs to be done better considering
    // how shitty javascript is at rounding
    // NOTE: this will have to implement the "penny paid per play"
    // as voted on in the 2021 AGM
    groupSums.artistTotalCredits = (groupSums.totalCredits * 0.7).toFixed(2)
    groupSums.resonateTotalCredits = (groupSums.totalCredits * 0.3).toFixed(2)
    groupSums.artistTotalEuros = (groupSums.artistTotalCredits / 1000 * 1.25).toFixed(2)
    groupSums.resonateTotalEuros = (groupSums.resonateTotalCredits / 1000 * 1.25).toFixed(2)
    return groupSums
  })

  return { report, sums }
}

module.exports = {
  findOneArtistEarnings
}
