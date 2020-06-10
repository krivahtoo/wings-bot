const aboutCommand = require('./about')
const startCommand = require('./start')
const statusCommand = require('./status')

const {
  banCommand,
  confirmCommand,
  newCommand,
  shareCommand,
  unbanCommand
} = require('./admin')

module.exports = {
  aboutCommand,
  startCommand,
  statusCommand,
  banCommand,
  confirmCommand,
  newCommand,
  shareCommand,
  unbanCommand
}
