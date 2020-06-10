const adminMiddleware = require('./admin')
const commandMiddleware = require('./command')
const dbMiddleware = require('./db')

module.exports = {
  adminMiddleware,
  commandMiddleware,
  dbMiddleware
}
