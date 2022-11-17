const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')

async function hashPassword ({ password }) {
  return await bcrypt.hash(password, 3)
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      },
      unique: true
    },
    legacyId: {
      type: DataTypes.INTEGER
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    emailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    displayName: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    fullName: {
      type: DataTypes.STRING
    },
    member: {
      type: DataTypes.BOOLEAN
    },
    newsletterNotification: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    lastLogin: {
      type: DataTypes.DATE
    },
    lastPasswordChange: {
      type: DataTypes.DATE
    },
    emailConfirmationToken: {
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
      unique: true
    },
    emailConfirmationExpiration: {
      type: DataTypes.DATE
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    paranoid: true,
    underscored: true,
    modelName: 'User',
    tableName: 'users',
    defaultScope: {
      attributes: [
        'id',
        'displayName',
        'email',
        'country',
        'emailConfirmed',
        'member',
        'roleId',
        'newsletterNotification']
    },
    scopes: {
      profile: () => ({
        subQuery: false,
        include: [
          {
            model: sequelize.models.Role,
            as: 'role',
            attribute: ['id', 'name']
          },
          {
            model: sequelize.models.Credit,
            as: 'credit'
          },
          {
            model: sequelize.models.UserGroup,
            as: 'userGroups',
            include: [{
              model: sequelize.models.UserGroupType,
              as: 'type'
            }, {
              model: sequelize.models.TrackGroup,
              required: false,
              attributes: ['enabled', 'private', 'releaseDate'],
              where: {
                enabled: true,
                private: false,
                releaseDate: {
                  [Op.gte]: sequelize.literal('NOW() - interval \'2 year\'')
                }
              },
              as: 'trackgroups'
            }, {
              model: sequelize.models.Track,
              attributes: [],
              as: 'tracks'
            }]
          },
          {
            model: sequelize.models.UserMembership,
            as: 'memberships',
            attributes: ['id', 'updatedAt'],
            include: [{
              model: sequelize.models.MembershipClass,
              as: 'class',
              attributes: ['name', 'id']
            }]
          }
        ]
      })
    },
    hooks: {
      beforeCreate: async (instance, options) => {
        instance.dataValues.email = instance.dataValues.email.toLowerCase()
        const hash = await hashPassword({
          password: instance.password
        })
        instance.dataValues.password = hash
      }
    }
  })

  User.associate = (models) => {
    User.hasOne(models.Role, { as: 'role', sourceKey: 'roleId', foreignKey: 'id' })
    User.hasOne(models.Credit, { as: 'credit', foreignKey: 'userId' })
    User.hasMany(models.UserGroup, { as: 'userGroups', foreignKey: 'ownerId' })
    User.hasMany(models.UserMembership, { as: 'memberships', foreignKey: 'userId' })
  }

  User.hashPassword = hashPassword

  User.checkPassword = async ({ hash, password }) => {
    const res = await bcrypt.compare(password, hash)
    return res
  }

  return User
}
