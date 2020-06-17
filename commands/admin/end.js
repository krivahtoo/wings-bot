'use strict'

const { reply, errorHandler } = require('../../helpers')

module.exports = () => async ctx => {
  ctx.tg.sendChatAction(ctx.chat.id, 'typing')
  if (ctx.group) {
    return ctx.reply('Command only available in group chat')
  }
  ctx.webhookReply = false
  const { Group } = ctx.database
  const group = await Group.findByPk(ctx.group.id)
  const sessions = await group.getSessions().catch(errorHandler)
  group.set({
    status: 'none'
  })
  group.save()
  if (!sessions) {
    return reply('No session to end.', ctx)
  }
  sessions.map(async session => {
    const res = await session.set({
      active: false
    })
    reply(`Session #${session.id} ended`, ctx)
    return res
  })
}
