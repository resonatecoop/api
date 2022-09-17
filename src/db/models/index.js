const path = require('path')
require('dotenv').config()
require('pg').defaults.parseInt8 = true
const sequelize = require('sequelize')
const { Sequelize, DataTypes } = sequelize
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/databases.js')[env]
const db = {}

db.Resonate = new Sequelize(config.database, config.username, config.password, { ...config, define: { underscored: true } })

db.Favorite = require(path.join(__dirname, '/resonate', 'favorite.js'))(db.Resonate, DataTypes)
db.File = require(path.join(__dirname, '/resonate', 'file.js'))(db.Resonate, DataTypes)
db.GfForm = require(path.join(__dirname, '/resonate', 'gf_form.js'))(db.Resonate, DataTypes)
db.Order = require(path.join(__dirname, '/resonate', 'order.js'))(db.Resonate, DataTypes)
db.Play = require(path.join(__dirname, '/resonate', 'play.js'))(db.Resonate, DataTypes)
db.Tag = require(path.join(__dirname, '/resonate', 'tag.js'))(db.Resonate, DataTypes)
db.TrackGroupItem = require(path.join(__dirname, '/resonate', 'track_group_item.js'))(db.Resonate, DataTypes)
db.TrackGroup = require(path.join(__dirname, '/resonate', 'track_group.js'))(db.Resonate, DataTypes)
db.Track = require(path.join(__dirname, '/resonate', 'track.js'))(db.Resonate, DataTypes)
db.UserMeta = require(path.join(__dirname, '/resonate', 'user_meta.js'))(db.Resonate, DataTypes)
db.Credit = require(path.join(__dirname, '/resonate', 'credit.js'))(db.Resonate, DataTypes)
db.User = require(path.join(__dirname, '/resonate', 'user.js'))(db.Resonate, DataTypes)
db.UserGroup = require(path.join(__dirname, '/resonate', 'user_group.js'))(db.Resonate, DataTypes)
db.Client = require(path.join(__dirname, '/resonate', 'client.js'))(db.Resonate, DataTypes)
db.Role = require(path.join(__dirname, '/resonate', 'role.js'))(db.Resonate, DataTypes)
db.UserGroupType = require(path.join(__dirname, '/resonate', 'user_group_type.js'))(db.Resonate, DataTypes)
db.MembershipClass = require(path.join(__dirname, '/resonate', 'membership_class.js'))(db.Resonate, DataTypes)
db.UserMembership = require(path.join(__dirname, '/resonate', 'user_membership.js'))(db.Resonate, DataTypes)
db.Link = require(path.join(__dirname, '/resonate', 'link.js'))(db.Resonate, DataTypes)
db.Address = require(path.join(__dirname, '/resonate', 'address.js'))(db.Resonate, DataTypes)
db.ShareTransaction = require(path.join(__dirname, '/resonate', 'share_transaction.js'))(db.Resonate, DataTypes)
db.Image = require(path.join(__dirname, '/resonate', 'image.js'))(db.Resonate, DataTypes)
db.UserGroupLink = require(path.join(__dirname, '/resonate', 'user_group_link.js'))(db.Resonate, DataTypes)

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
