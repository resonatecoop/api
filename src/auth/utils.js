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

module.exports.logoutSource = (ctx, form) => {
  ctx.type = 'html'
  return ctx.render('logout', {
    form,
    host: ctx.host
  })
}

module.exports.postLogoutSuccessSource = async (ctx) => {
  ctx.body = `<!DOCTYPE html>
    <head>
      <title>Signed out</title>
    </head>
    <body>
      <script>
        window.close()
      </script>
    </body>
    </html>`
}
