'use strict'

const debug = require('debug')('bot:middleware')
const { admins } = require('../config')

module.exports = () => async (ctx, next) => {
  if (ctx.from) {
    let admin = false
    admin = admins.includes(ctx.from.id)
    if (ctx.chat && ctx.chat.type === 'supergroup' && !admin) {
      const status = ['administrator', 'creator']
      const user = ctx.getChatMember(ctx.from.id)
      admin = status.includes(user.status)
    }
    ctx.admin = admin
    debug('User admin', ctx.admin)
  }
  return next()
}
