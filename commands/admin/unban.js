'use strict'

const { reply, makeUserMention, errorHandler } = require('../../helpers')

module.exports = () => async ctx => {
  ctx.tg.sendChatAction(ctx.chat.id, 'typing')
  const { User } = ctx.database

  if (!ctx.message.reply_to_message) {
    return reply('Nobody to unban. Use the command in reply to the user to unban.', ctx)
  }
  const usr = ctx.message.reply_to_message.from

  if (!usr) {
    return reply('I don\'t think that is a user', ctx)
  }

  const user = await User
    .findByPk(usr.id)
    .then(user => {
      user.banned = false
      return user.save()
    })
    .catch(errorHandler)
  if (!user) {
    return reply('Could not unban user', ctx)
  }

  return reply(`${makeUserMention(usr)} was unbanned.`, ctx)
}
