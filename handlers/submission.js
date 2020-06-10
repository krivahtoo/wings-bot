'use strict'

const { reply, emoji, regex, errorHandler } = require('../helpers')

module.exports = () => async (ctx) => {
  ctx.tg.sendChatAction(ctx.chat.id, 'typing')
  const type = ctx.match[1].toLowerCase()
  const txt = ctx.message.text.trim()
  const { Channel, Submission, Group } = ctx.database
  const group = await Group
    .findByPk(
      Number(ctx.group.id)
    )
    .then(g => g).catch(errorHandler)

  const session = await group
    .getSessions({
      where: {
        active: true
      },
      limit: 1
    }).then(s => s).catch(errorHandler)

  if (!session) {
    return reply('Seems there is no active session.', ctx)
  }

  if (ctx.session.user.banned) {
    return reply('Sorry you are banned\nYou cant paticipate in channel submission', ctx)
  }

  if (group.status === type) {
    switch (type) {
      case 'new':
        if (regex().test(txt)) {
          let match
          let submission = {
            confirmed: false,
            shared: false,
            messageId: ctx.message.id
          }
          while ((match = regex().exec(txt)) !== null) {
            const channel = {}
            let emojiCount = 0
            let wordCount = 0

            channel.username = match[2]
            channel.subscribers = match[3]
            channel.description = match[4]
            channel.inviteLink = match[5]

            const channelId = await ctx.tg.getChat(channel.username)
              .then(c => c.id)
              .catch(errorHandler)

            if (!channelId) {
              return reply('Invalid channel username.', ctx)
            }
            channel.id = channelId

            const subs = await ctx.tg.getChatMembersCount(channel.username).catch(errorHandler)
            if (subs < group.minSubs) {
              return reply(`Sorry your channel @${channel.username} has *${subs}*.`, ctx)
            }
            channel.subscribers = subs

            while ((emoji().exec(channel.description)) !== null) {
              emojiCount++
            }
            if (emojiCount > 2) {
              return reply('Sorry not more than 2 emojis alowed.', ctx)
            }

            while ((/(\w+)/gi.exec(channel.description)) !== null) {
              wordCount++
            }
            if (wordCount > group.maxWords) {
              return reply(
                `Sorry not more than ${group.maxWords} words allowed.\n` +
                `You entered *${wordCount}* words for ${channel.username}`,
                ctx
              )
            }

            const chn = await Channel
              .findOne({
                where: {
                  username: channel.username
                }
              })
              .then(chl => {
                if (chl && chl.id) {
                  return chl
                } else {
                  channel.banned = false
                  const newChannel = new Channel(channel)
                  newChannel.save()
                  return newChannel
                }
              })
              .catch(errorHandler)
            if (chn.banned) {
              return reply(`Sorry your channel ${chn.username} is banned.`, ctx)
            }
            chn.setUser(ctx.session.user.id)

            const subm = await session.getSubmissions({
              includes: [{
                model: Channel,
                where: {
                  username: chn.username
                }
              }]
            })

            if (subm) {
              return reply('Don\'t submit more than once.', ctx)
            }

            submission = new Submission(submission)
            submission.setChannel(chn)
            session.addSubmission(submission)
            session.save()
          }
        } else {
          return reply('Incorrect format\nPlease resubmit with the correct', ctx)
        }
        break
      case 'confirm':
        if (regex(type).test(txt)) {
          let match
          while ((match = regex().exec(txt)) !== null) {
            const channelChat = await ctx.tg.getChat(match[2]).catch(errorHandler)
            const channel = await Channel
              .findByPk(Number(channelChat.id))
              .then(c => c)
              .catch(errorHandler)
            if (!channel) {
              return reply('You have not submitted your channel', ctx)
            }
            const submissions = session
              .getSubmissions({
                includes: [{
                  model: Channel,
                  where: {
                    id: channel.id
                  }
                }]
              })
              .then(s => s).catch(errorHandler)
            if (!submissions) {
              return reply('You have not submitted your channel', ctx)
            }
            submissions.map(val => {
              val.confirmed = true
              val.save()
            })
          }
        } else {
          return reply('Incorrect format.\nPlease confirm with the correct.', ctx)
        }
        break
      case 'shared':
        if (regex(type).test(txt)) {
          let match
          while ((match = regex().exec(txt)) !== null) {
            const channelChat = await ctx.tg.getChat(match[2]).catch(errorHandler)
            const channel = await Channel
              .findByPk(Number(channelChat.id))
              .then(c => c).catch(errorHandler)
            if (!channel) {
              return reply('You have not submitted your channel', ctx)
            }
            const submissions = await session
              .getSubmissions({
                where: {
                  confirmed: true
                },
                includes: [{
                  model: Channel,
                  where: {
                    id: channel.id
                  }
                }]
              })
              .then(s => s).catch(errorHandler)
            if (!submissions) {
              return reply('You have not submitted or confirmed your channel', ctx)
            }
            submissions.map(val => {
              val.shared = true
              val.save()
            })
          }
        } else {
          return reply('Incorrect format.\nPlease with the correct link.', ctx)
        }
        break

      default:
        return reply('Please use the correct hashtag.', ctx)
    }
  } else {
    return reply(`#${type} is currently closed.`, ctx)
  }
}
