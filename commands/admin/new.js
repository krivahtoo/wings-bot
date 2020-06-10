'use strict'

const { reply } = require('../../helpers')

module.exports = () => async ctx => {
  ctx.tg.sendChatAction(ctx.chat.id, 'typing')
  if (!ctx.group) {
    ctx.reply('Command only available in group chat')
  }
  ctx.webhookReply = false
  const { Session, Group } = ctx.database
  const group = await Group.findByPk(ctx.group.id)
  const session = new Session({
    active: true,
    status: 'new'
  })
  session.save()
  group.addSession(session)
  group.status = 'new'
  group.save()

  const msg = reply(
    '🔰🔰 *Hello Admins* 🔰🔰\n' +
    '〽 *Channel Submission Started*\n' +
    `_Session #${session.id}_\n\n` +
    'Your submission Should have the following:-\n\n' +
    '1️⃣ #new\n' +
    '2️⃣ @channelusername\n' +
    '3️⃣ *No. of subscribers*\n' +
    `4️⃣ Max ${group.maxWords} word description (+2 emojis)\n` +
    '5️⃣ Channel private link (Link priview removed)\n\n' +
    '*Example:*\n' +
    '#new @ModedGames 10k\n' +
    '🎮 Mod and Paid Games 🎮\n' +
    // eslint-disable-next-line no-useless-escape
    'https://t.me/joinchat/AAAAAEO24LnEQ\_W7Jp-CMwn\n\n' +
    '*NB:*\n' +
    '⭕ Any other format will automatically be rejected.\n' +
    '⭕ Do not submit twice\n' +
    `⭕ ${group.minSubs}+ Subscribers`,
    ctx
  )
  ctx.pinChatMessage(msg.id)
}
