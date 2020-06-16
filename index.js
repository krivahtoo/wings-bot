'use strict'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const debug = require('debug')('bot')
const path = require('path')
const express = require('express')
const LocalSession = require('telegraf-session-local')
const Telegraf = require('telegraf')
const limit = require('telegraf-ratelimit')
const db = require('./db')

const {
  ratelimit
} = require('./config')

const {
  submissionHandler
} = require('./handlers')

const {
  aboutCommand,
  startCommand,
  statusCommand,
  banCommand,
  confirmCommand,
  newCommand,
  shareCommand,
  unbanCommand
} = require('./commands')

const {
  dbMiddleware,
  adminMiddleware,
  commandMiddleware,
  timeMiddleware
} = require('./middlewares')

const {
  BOT_USERNAME,
  BOT_TOKEN,
  NODE_ENV,
  PORT,
  PROJECT_DOMAIN
} = process.env

db.sequelize
  .authenticate()
  .then(() => {
    debug('Connection has been established successfully.')
  })
  .catch(err => {
    debug('Unable to establish database connection: ', err)
  })

db.sequelize
  .sync()
  .then(() => debug('Initialized database'))

const session = new LocalSession({
  database: path.join(__dirname, '/.data/session.json'),
  storage: LocalSession.storageFileAsync
})

const init = async (bot) => {
  debug('Initializing bot')
  bot.context.database = db

  /**
   * Middlewares
   */
  bot.use(timeMiddleware())
  bot.use(session.middleware())
  bot.use(adminMiddleware())
  bot.use(limit(ratelimit.text))
  bot.use(commandMiddleware())
  bot.use(dbMiddleware())

  /**
   * Actions
   */
  bot.action(/^about$/, aboutCommand())

  /**
   * Commands
   */
  bot.start(startCommand())
  bot.command('about', aboutCommand())
  bot.command('status', statusCommand())
  bot.command('ban', banCommand())
  bot.command('confirm', confirmCommand())
  bot.command('new', newCommand())
  bot.command('share', shareCommand())
  bot.command('unban', unbanCommand())

  /**
   * Handlers
   */
  bot.hears(/^#(new|confirm|shared|[a-z]+)/i, submissionHandler())
  // bot.on('new_chat_members', )

  return bot
}

/**
 * Init bot function.
 *
 * @param {Telegraf} bot The bot instance.
 *
 * @return {Promise<Telegraf>} Bot ready to launch.
 */
init(new Telegraf(BOT_TOKEN, {
  username: BOT_USERNAME
}))
  .then((bot) => {
    debug('Booting %s', BOT_USERNAME)

    const hook = `/_run/bot/${BOT_TOKEN}`
    /**
     * Run webhook
     */
    if (NODE_ENV === 'production') {
      bot.telegram.setWebhook(`https://${PROJECT_DOMAIN}.glitch.me${hook}`)
    } else {
      bot.telegram.setWebhook(`${PROJECT_DOMAIN}${hook}`)
    }

    const app = express()
    app.use(express.static(path.join(__dirname, '/public')))
    app.get('/users', async (req, res) => {
      res.send(await db.User.findAll())
    })
    app.get('/channels', async (req, res) => {
      res.send(await db.Channel.findAll())
    })
    app.get('/groups', async (req, res) => {
      res.send(await db.Group.findAll())
    })
    app.use(bot.webhookCallback(hook))
    app.listen(PORT, () => {
      debug(`Bot listening to ${PROJECT_DOMAIN} on port ${PORT}`)
    })
  })
