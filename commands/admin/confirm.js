'use strict'

const debug = require('debug')('bot:command')
const { Extra } = require('telegraf')
const { reply, errorHandler, escapeMarkdown } = require('../../helpers')

module.exports = () => async ctx => {
  ctx.tg.sendChatAction(ctx.chat.id, 'typing')
  if (!ctx.group) {
    return ctx.reply('Command only available in group chat')
  }
  ctx.webhookReply = false
  const { Group } = ctx.database
  const group = await Group.findByPk(ctx.group.id)
  const session = await group.getSessions({
    where: {
      active: true
    },
    limit: 1
  })
    .then(s => {
      if (Array.isArray(s)) {
        return s[0]
      } else {
        return s
      }
    })
    .catch(errorHandler)
  if (!session) {
    return reply('No session to confirm.', ctx)
  }
  group.set({ status: 'confirm' })
  group.save()

  const submissions = await session.getSubmissions()
  debug('available submissions %O', submissions)
  let text = '*Confirm list*'

  for (let i = 0; i < submissions.length; i++) {
    const channel = await submissions[i].getChannel()
    text += `\n@${escapeMarkdown(channel.username)}`
  }

  const message = await reply(text, ctx)

  const msg = await ctx.replyWithMarkdown(
    '🔰🔰 *Hello Admins* 🔰🔰\n' +
    '*Confirm your channels from the list above.*\n' +
    `_Session #${session.id}_\n\n` +
    'Send the following to confirm your channel:-\n\n' +
    '1️⃣ #confirm\n' +
    '2️⃣ @channelusername\n\n' +
    '*Example:*\n' +
    '#confirm @ModedGames\n\n' +
    '*NB:*\n' +
    '⭕ *ONLY* confirm if you are sure you will share the final list',
    Extra.inReplyTo(message.message_id).webPreview(false)
  )
  ctx.pinChatMessage(msg.message_id)
}
