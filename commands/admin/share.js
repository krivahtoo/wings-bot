'use strict'

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
    return reply('No session to share.', ctx)
  }
  group.set({ status: 'share' })
  group.save()

  const submissions = await session.getSubmissions()
  let text =
    '⭕⭕ Check out this top rated channels of this week ⭕⭕\n\n' +
    '📊 _Promoted by:_ [Wings Promotion](https://t.me/wingspromotion)\n' +
    '〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰\n'

  submissions.map(async submission => {
    const channel = await submission.getChannel()
    text +=
      `\n✅ [@${channel.username}](${channel.inviteLink})\n` +
      `*${escapeMarkdown(channel.description)}*\n`
  })
  const message = await ctx.tg.sendMessage(
    '@wingspromotion',
    text,
    Extra.markdown()
  ).catch(errorHandler)

  const msg = await ctx.replyWithMarkdown(
    '🔰🔰 *Hello Admins* 🔰🔰\n' +
    '*Final list is out*' +
    ` _Session #${session.id}_\n\n` +
    `[Here](https://t.me/wingspromotion/${message.message_id})\n\n` +
    'Forward the list your channel and report back to the group with the following:-\n' +
    '1️⃣ #shared\n' +
    '2️⃣ Shared list post link\n\n' +
    '*Example:*\n' +
    '#shared https://t.me/ModedGames/1234\n\n' +
    '*NB:*\n' +
    '⭕ 2hr on top and 48hrs on channel\n' +
    '⭕ You have 48hrs to share the list\n' +
    '⭕ Failure to share will result in instant ban.',
    Extra.webPreview(false)
  )
  return ctx.pinChatMessage(msg.message_id)
}
