const { Client } = require('../db/models')
const { Op } = require('sequelize')

module.exports = {
  origin: async (req) => {
    const hasClientsWithOrigin = await Client.findAll({
      where: {
        'metaData.allowed-cors-origins': { [Op.contains]: JSON.stringify(req.header.origin) }
      }
    })

    if (hasClientsWithOrigin.length > 0) {
      return req.header.origin
    }
  },
  credentials: true,
  headers: ['Content-Type', 'Authorization']
}
