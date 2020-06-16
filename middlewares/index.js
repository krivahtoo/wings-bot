const adminMiddleware = require('./admin')
const commandMiddleware = require('./command')
const dbMiddleware = require('./db')
const timeMiddleware = require('./time')

module.exports = {
  adminMiddleware,
  commandMiddleware,
  dbMiddleware,
  timeMiddleware
}
