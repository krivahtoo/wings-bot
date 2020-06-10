module.exports = {
  ratelimit: {
    text: {
      window: 3000,
      limit: 1,
      onLimitExceeded: (ctx, next) => {
        if (ctx.admin) {
          return next()
        }
        return ctx.reply('😠 Do not spam!!')
      }
    }
  },
  admins: [
    374004148, // Krivah
    1001567256, // Gabu
    538235648, // Brian
    660228121, // Derrick
    1000357853,
    371173693
  ],
  channel: 1143293223
}
