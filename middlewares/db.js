'use strict'

const debug = require('debug')('bot:database')
const { errorHandler, keysToCamel } = require('../helpers')

module.exports = () => async (ctx, next) => {
  const { User, Group } = ctx.database
  if (ctx.from) {
    const from = keysToCamel(ctx.from)
    const id = Number(from.id)

    const usr = await User
      .findByPk(id)
      .then(async user => {
        if (user && user.id) {
          debug('User was already created')

          return update(user, from)
        } else {
          debug('Saving a new user.')
          from.banned = false
          const newUser = new User(from)
          newUser.save()
          return newUser
        }
      })

    ctx.session.user = usr
  }
  if (ctx.chat && ctx.chat.type === 'supergroup') {
    const chat = keysToCamel(ctx.chat)
    let subs

    const reg = /^\|([0-9]+)(k*)\+\|/
    if (reg.test(chat.title)) {
      const match = reg.exec(chat.title)
      subs = match[1]
      if (match[2] && match[2] === 'k') {
        subs = `${subs}000`
      }
      subs = Number(subs)
    } else {
      subs = 0
    }
    chat.minSubs = subs

    const grp = await Group
      .findByPk(Number(chat.id))
      .then(group => {
        if (group && group.id) {
          return update(group, chat)
        } else {
          debug('Saving a new group')
          chat.maxWords = 5
          const newGrp = new Group(chat)
          newGrp.save()
          return newGrp
        }
      })
    ctx.group = grp
  }

  return next()
}

const update = async (Model, data) => {
  const diff = Object.keys(data).reduce((acc, key) => {
    if (key === 'id') {
      return acc
    }
    if (typeof data[key] === 'boolean') {
      Model[key] = Boolean(Model[key])
    }
    if (data[key] !== Model[key]) {
      acc[key] = data[key]
    }
    return acc
  }, {})

  const fields = { ...diff }

  if (Object.keys(diff).length > 0) {
    debug('updating Model data: %o', fields)
    await Model.update(fields).catch(errorHandler)
  }

  return Model
}
