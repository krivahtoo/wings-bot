'use strict'

const debug = require('debug')('bot:middleware')

module.exports = () => (ctx, next) => {
  const start = new Date().getTime()
  return next().then(() => {
    const end = new Date().getTime()
    debug('Finished in %d ms', end - start)
  })
}
