// const fs = require('fs')
const path = require('path')
require('dotenv').config()
require('pg').defaults.parseInt8 = true
const sequelize = require('sequelize')
const { Sequelize, DataTypes } = sequelize
// const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/databases.js')[env]
const db = {}

// const database = Object.keys(config)
db.Resonate = new Sequelize(config.database, config.username, config.password, config)

db.Favorite = require(path.join(__dirname, '/resonate', 'favorite.js'))(db.Resonate, DataTypes)
db.File = require(path.join(__dirname, '/resonate', 'file.js'))(db.Resonate, DataTypes)
db.GfForm = require(path.join(__dirname, '/resonate', 'gf_form.js'))(db.Resonate, DataTypes)
db.Order = require(path.join(__dirname, '/resonate', 'order.js'))(db.Resonate, DataTypes)
db.Play = require(path.join(__dirname, '/resonate', 'play.js'))(db.Resonate, DataTypes)
db.Tag = require(path.join(__dirname, '/resonate', 'tag.js'))(db.Resonate, DataTypes)
db.TrackGroupItem = require(path.join(__dirname, '/resonate', 'track_group_item.js'))(db.Resonate, DataTypes)
db.TrackGroup = require(path.join(__dirname, '/resonate', 'track_group.js'))(db.Resonate, DataTypes)
db.Track = require(path.join(__dirname, '/resonate', 'track.js'))(db.Resonate, DataTypes)
db.Artist = require(path.join(__dirname, '/resonate', 'artist.js'))(db.Resonate, DataTypes)

db.UserMeta = require(path.join(__dirname, '/userapi', 'user_meta.js'))(db.Resonate, DataTypes)
db.Credit = require(path.join(__dirname, '/userapi', 'credit.js'))(db.Resonate, DataTypes)
db.User = require(path.join(__dirname, '/userapi', 'user.js'))(db.Resonate, DataTypes)
db.UserGroup = require(path.join(__dirname, '/userapi', 'usergroup.js'))(db.Resonate, DataTypes)
db.Client = require(path.join(__dirname, '/userapi', 'client.js'))(db.Resonate, DataTypes)

db.sequelize = sequelize
db.Sequelize = Sequelize

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

module.exports.sequelize = sequelize
module.exports.Sequelize = Sequelize
module.exports = { ...module.exports, ...db }
