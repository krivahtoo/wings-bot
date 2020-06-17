'use strict'

const debug = require('debug')('bot:handlers')
const { reply, emoji, regex, errorHandler } = require('../helpers')

module.exports = () => async (ctx) => {
  ctx.tg.sendChatAction(ctx.chat.id, 'typing')
  const type = ctx.match[1].toLowerCase()
  const txt = ctx.message.text.trim()
  const { Channel, Submission, Group } = ctx.database
  const newReg = regex('new')
  const confirmReg = regex('confirm')
  const sharedReg = regex('shared')
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
    }).then(s => s[0]).catch(errorHandler)

  if (!session) {
    return reply('Seems there is no active session.', ctx)
  }

  if (ctx.session.user.banned) {
    return reply('Sorry you are banned\nYou cant paticipate in channel submission', ctx)
  }

  if (group.status === type) {
    switch (type) {
      case 'new':
        if (regex('new').test(txt)) {
          let match
          let submission = {
            confirmed: false,
            shared: false,
            messageId: ctx.message.message_id,
            sessionId: session.id
          }
          debug('msub %O', submission)
          while ((match = newReg.exec(txt)) !== null) {
            debug('match')
            const channel = {}
            let emojiCount = 0
            const emojiReg = emoji()
            const wordReg = /(\w+)/gi
            let wordCount = 0

            channel.username = match[2]
            channel.subscribers = match[3]
            channel.description = match[4]
            channel.inviteLink = match[5]

            const channelId = await ctx.tg.getChat(`@${channel.username}`)
              .then(c => c.id)
              .catch(errorHandler)

            if (!channelId) {
              return reply('Invalid channel username.', ctx)
            }
            channel.id = channelId

            const subs = await ctx.tg.getChatMembersCount(channelId).catch(errorHandler)
            if (subs < group.minSubs) {
              return reply(`Sorry your channel @${channel.username} has *${subs}*.`, ctx)
            }
            debug('channel subs ', subs)
            channel.subscribers = subs

            while ((emojiReg.exec(channel.description)) !== null) {
              emojiCount++
            }
            debug('found %d emojies', emojiCount)
            if (emojiCount > 2) {
              return reply('Sorry not more than 2 emojis alowed.', ctx)
            }

            while ((wordReg.exec(channel.description)) !== null) {
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
              .findByPk(channelId)
              .then(async chl => {
                if (chl) {
                  debug('channel exists')
                  return chl
                } else {
                  channel.banned = false
                  const newChannel = new Channel(channel)
                  newChannel.setOwner(ctx.session.user.id)
                  debug('saving a new Channel')
                  await newChannel.save()
                  return newChannel
                }
              })
              .catch(errorHandler)
            if (chn.banned) {
              return reply(`Sorry your channel ${chn.username} is banned.`, ctx)
            }

            const subm = await session
              .getSubmissions({
                where: {
                  channelId: chn.id
                }
              })
              .then(s => s[0])
              .catch(errorHandler)

            if (subm) {
              return reply('Don\'t submit more than once.', ctx)
            }
            submission.channelId = chn.id

            submission = new Submission(submission)
            submission.save()
            session.addSubmission(submission)
            session.save()
            reply('✔', ctx)
          }
        } else {
          return reply('Incorrect format\nPlease resubmit with the correct', ctx)
        }
        break
      case 'confirm':
        if (regex('confirm').test(txt)) {
          let match
          while ((match = confirmReg.exec(txt)) !== null) {
            const channelChat = await ctx.tg.getChat(`@${match[2]}`).catch(errorHandler)
            const channel = await Channel
              .findByPk(Number(channelChat.id))
              .then(c => c)
              .catch(errorHandler)
            if (!channel) {
              return reply('You have not submitted your channel', ctx)
            }
            const submission = await session
              .getSubmissions({
                where: {
                  channelId: channel.id
                }
              })
              .then(s => s[0]).catch(errorHandler)
            if (!submission) {
              return reply('You have not submitted your channel', ctx)
            }
            submission.set({ confirmed: true })
            submission.save()
            reply('✔', ctx)
          }
        } else {
          return reply('Incorrect format.\nPlease confirm with the correct.', ctx)
        }
        break
      case 'shared':
        if (regex('shared').test(txt)) {
          let match
          while ((match = sharedReg.exec(txt)) !== null) {
            const channelChat = await ctx.tg.getChat(`@${match[2]}`).catch(errorHandler)
            const channel = await Channel
              .findByPk(Number(channelChat.id))
              .then(c => c).catch(errorHandler)
            if (!channel) {
              return reply('You have not submitted your channel', ctx)
            }
            const submission = await session
              .getSubmissions({
                where: {
                  confirmed: true,
                  channelId: channel.id
                }
              })
              .then(s => s[0]).catch(errorHandler)
            if (!submission) {
              return reply('You have not submitted or confirmed your channel', ctx)
            }
            submission.set({ shared: true })
            submission.save()
            reply('✔', ctx)
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
