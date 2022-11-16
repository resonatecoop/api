module.exports.renderError = (ctx, out, error) => {
  console.error(error)
  ctx.type = 'html'
  return ctx.render('root-page', {
    messages: {
      error: Object.entries(out)
        .map(([key, val]) => `${key}: ${val}`)
    }
  })
}
