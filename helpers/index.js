const err = require('debug')('bot:error')
const fs = require('fs')
const path = require('path')
const { Extra } = require('telegraf')
const emoji = require('./emoji')

const errorHandler = (error) => {
  err(error)
  return false
}

const regex = (type = 'new') => {
  switch (type) {
    case 'new':
      // eslint-disable-next-line no-useless-escape
      return /#(new)(?:\n| )@([0-9a-z_]+)(?:\n| )([0-9]+k*)(?:\n| )(.+)(?:\n| )(https:\/\/t\.me\/(joinchat\/|)[0-9a-z_\-]+)/gi
    case 'confirm':
      return /#(confirm)(?:\n| )@([0-9a-z_]+)/gi
    case 'shared':
      return /#(shared)(?:\n| )https:\/\/t\.me\/([0-9a-z_]+)\/[0-9]+/gi
  }
}

const getAdminCommands = () => {
  return fs.readdirSync(path.join(__dirname, '/../commands/admin/')).map(val => val.replace(/(\.\/|\.js)/g, ''))
}

const makeUserMention = ({
  id,
  username,
  first_name: firstName,
  last_name: lastName
}) => username
  ? `@${username}`
  : `[${firstName || lastName}](tg://user?id=${id})`

const escapeMarkdown = (text) => {
  let txt
  const chars = ['_', '*', '`', '[']
  chars.forEach(chr => {
    txt = text.replace(chr, `\\${chr}`)
  })
  return txt
}

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  })
}

const isArray = function (a) {
  return Array.isArray(a)
}

const isObject = (o) => {
  return o === Object(o) && !isArray(o) && typeof o !== 'function'
}

const keysToCamel = (o) => {
  if (isObject(o)) {
    const n = {}

    Object.keys(o)
      .forEach((k) => {
        n[toCamel(k)] = keysToCamel(o[k])
      })

    return n
  } else if (isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i)
    })
  }

  return o
}

const reply = async (text, ctx) => {
  const res = ctx.replyWithMarkdown(text, Extra.inReplyTo(ctx.message.message_id))
  return res
}

module.exports = {
  errorHandler,
  makeUserMention,
  getAdminCommands,
  escapeMarkdown,
  keysToCamel,
  emoji,
  regex,
  reply
}
