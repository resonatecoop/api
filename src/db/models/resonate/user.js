const bcrypt = require('bcryptjs')

async function hashPassword ({ password }) {
  return await bcrypt.hash(password, 3)
  // const salt = generateSalt()
  // const hash = crypto
  //   .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
  //   .toString('base64')
  // return `${hash}:${salt}`
}

// function generateSalt () {
//   return crypto.randomBytes(16).toString('base64')
// }

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
    defaultScope: {
      attributes: {
        exclude: ['password']
      }
    },
    paranoid: true,
    underscored: true,
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
    User.hasMany(models.UserMembership, { as: 'memberships', foreignKey: 'userId' })
  }

  User.hashPassword = hashPassword

  User.checkPassword = async ({ hash, password }) => {
    const res = await bcrypt.compare(password, hash)
    return res
  }

  return User
}
