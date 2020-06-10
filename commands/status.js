const { errorHandler } = require('../helpers')

module.exports = () => async ctx => {
  let text = '*Your Channels*'
  if (ctx.chat.type === 'private') {
    const { User, Channel, Submission } = ctx.database
    const usr = await User.findByPk(ctx.session.user.id, {
      include: [{
        model: Channel,
        include: [Submission]
      }]
    })
    const channels = await usr.getChannels()
    if (channels && channels.length > 0) {
      channels.map(async chn => {
        text += `\nChannel @${chn.username}`
        const submissions = await chn.getSubmissions().catch(errorHandler)
        const submission = submissions[0]
        if (!submission.confirmed) {
          text += ' not confirmed'
        } else if (!submission.shared) {
          text += ' not shared'
        }
      })
    } else {
      text = 'You have no registered channel.'
    }
  } else {
    text = 'Command only available only in private.'
  }

  ctx.replyWithMarkdown(text)
}
