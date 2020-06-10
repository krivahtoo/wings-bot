module.exports = () => ctx => {
  let text
  if (ctx.chat.type === 'private') {
    text =
      `Hi, *${ctx.from.first_name}*\n\n` +
      'Welcome, I am Wings Promotion Bot 🤖\n\n' +
      'Join Wings Promotion group where we promote channels for free'
  } else {
    text =
      `Hi, *${ctx.from.first_name}*\n\n` +
      'I am Wings Promotion Bot 🤖\n' +
      'I manage group channel promotions.'
  }

  ctx.replyWithMarkdown(text)
}
