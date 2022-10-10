const { User, Role, UserGroupType, UserGroup, Credit, MembershipClass, UserMembership, ShareTransaction, Client, Resonate: sequelize } = require('../models')
const { keyBy } = require('lodash')
const { Op } = require('sequelize')

const role = {
  1: 'superadmin',
  2: 'admin',
  3: 'tenantadmin',
  4: 'label',
  5: 'artist',
  6: 'user'
}

const migrateUsers = async (client) => {
  await User.destroy({
    force: true,
    where: {
      email: {
        [Op.notLike]: '%admin.com' // Don't delete test admin accounts
      }
    }
  })
  const roles = await Role.findAll()
  const rolesMap = keyBy(roles, 'name')
  const duplicateUsers = []

  const results = await client.query('SELECT * FROM users')

  try {
    await User.bulkCreate(results.rows.map(result => ({
      id: result.id,
      legacyId: result.legacy_id,
      password: result.password,
      email: result.username,
      emailConfirmed: result.email_confirmed,
      createdAt: result.created_at,
      updatedAt: result.updated_at ?? result.created_at,
      displayName: result.full_name ?? ((result.first_name || result.last_name) && `${result.first_name} ${result.last_name}`),
      country: result.country,
      member: result.member,
      newsletterNotification: result.newsletter_notification,
      roleId: rolesMap[role[result.role_id]].id,
      lastLogin: result.last_login,
      lastPasswordChange: result.last_password_change
    })))
  } catch (e) {
    console.error('error CREATING USER', e)
    throw e
  }

  console.log('Found duplicates', duplicateUsers)
}

const migrateUserGroups = async (client) => {
  await UserGroup.destroy({
    truncate: true,
    force: true
  })
  const types = await UserGroupType.findAll()
  const typeMap = keyBy(types, 'name')

  const results = await client.query('SELECT * FROM user_groups')
  try {
    await UserGroup.bulkCreate(results.rows
      // FIXME: we'll want to migrate these over
      .filter(result => result.owner_id !== '00000000-0000-0000-0000-000000000000')
      .map(result => ({
        createdAt: result.created_at,
        displayName: result.display_name,
        updatedAt: result.updated_at ?? result.created_at,
        ownerId: result.owner_id !== '00000000-0000-0000-0000-000000000000' ? result.owner_id : null,
        description: result.description,
        shortBio: result.short_bio,
        email: result.group_email,
        typeId: typeMap[result.type.Name]?.id ?? typeMap.artist?.id
      })))

    await sequelize.query(`
        UPDATE users
          SET display_name = (
            SELECT user_groups.display_name 
            FROM user_groups 
            WHERE users.id = user_groups.owner_id 
            LIMIT 1)
      `)
  } catch (e) {
    console.error('error CREATING USER GROUP', e)
    throw e
  }
}

const migrateCredits = async (client) => {
  const results = await client.query('SELECT * FROM credits')

  try {
    await Credit.bulkCreate(results.rows.map(result => ({
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      userId: result.user_id,
      total: result.total
    })))
  } catch (e) {
    console.error('error CREATING CREDIT', e)
    throw e
  }
}

const migrateUserMemberships = async (client) => {
  const classes = await MembershipClass.findAll()
  const classesMap = keyBy(classes, 'name')
  const remoteClasses = await client.query('SELECT * FROM membership_classes')
  const remoteById = keyBy(remoteClasses.rows, 'id')
  const results = await client.query('SELECT * FROM user_memberships')

  await Promise.all(results.rows.map(async result => {
    try {
      const remoteClass = result.membership_class.Name ?? remoteById[result.membership_class_id].name
      const [userMembership, newlyCreated] = await UserMembership.findOrCreate({
        where: { id: result.id },
        defaults: {
          createdAt: result.created_at,
          updatedAt: result.updated_at ?? result.created_at,
          userId: result.user_id,
          membershipClassId: classesMap[remoteClass].id,
          subscriptionId: result.subscription_id,
          start: result.start,
          end: result.end
        }
      })
      console.log('created USER MEMBERSHIP', userMembership.get({ plain: true }).userId, newlyCreated)
    } catch (e) {
      console.log('error CREATING USER MEMBERSHIP', result, e)
      throw e
    }
  }))
}

const migrateShareTransactions = async (client) => {
  const results = await client.query('SELECT * FROM share_transactions')

  await Promise.all(results.rows.map(async result => {
    try {
      const [share, newlyCreated] = await ShareTransaction.findOrCreate({
        where: { id: result.id },
        defaults: {
          createdAt: result.created_at,
          updatedAt: result.updated_at ?? result.created_at,
          userId: result.user_id,
          invoiceId: result.invoice_id,
          quantity: result.quantity
        }
      })
      console.log('created SHARE', share.get({ plain: true }).userId, result.quantity, newlyCreated)
    } catch (e) {
      console.log('error CREATING SHARE TRANSACTION', result, e)
      throw e
    }
  }))
}

const migrateClients = async (client) => {
  const results = await client.query('SELECT * FROM clients')

  await Promise.all(results.rows.map(async result => {
    try {
      const [share, newlyCreated] = await Client.findOrCreate({
        where: { applicationURL: result.application_url },
        defaults: {
          createdAt: result.created_at,
          updatedAt: result.updated_at ?? result.created_at,
          // key: result.key,
          secret: result.secret,
          grantTypes: ['authorization_code'],
          responseTypes: ['code'],
          redirectURIs: [result.redirect_uri],
          applicationName: result.application_name,
          applicationURL: result.application_url
        }
      })
      console.log('created CLIENT', share.get({ plain: true }).applicationName, newlyCreated)
    } catch (e) {
      console.log('error CREATING SHARE TRANSACTION', result, e)
      throw e
    }
  }))
}

module.exports = async (client) => {
  await migrateUsers(client)
  console.log('done migrating from users!')
  await migrateUserGroups(client)
  console.log('done migrating from user groups!')
  await migrateCredits(client)
  await migrateUserMemberships(client)
  await migrateShareTransactions(client)
  await migrateClients(client)

  console.log('done migrating from user-api!')
}
