const crypto = require('crypto')

function hashPassword ({ password }) {
  const salt = generateSalt()
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
    .toString('base64')
  return `${hash}:${salt}`
}

function generateSalt () {
  return crypto.randomBytes(16).toString('base64')
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
      type: DataTypes.INTEGER,
      primaryKey: false,
      autoIncrement: true // SERIAL on postgres
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
    roleId: {
      type: DataTypes.INTEGER
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
    underscore: true,
    modelName: 'User',
    tableName: 'users',
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
    User.hasMany(models.UserGroup, { as: 'user_groups', foreignKey: 'ownerId' })
  }

  User.hashPassword = hashPassword

  User.checkPassword = async ({ hash, password }) => {
    const splitted = hash.split(':')
    if (splitted[1]) {
      const salt = splitted[1]
      const newHash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('base64')
      if (newHash.toString() === splitted[0]) {
        return true
      }
    }
    return false
  }

  return User
}
