const dotenv = require('dotenv-safe')
const app = require('./src/index.js')

dotenv.config()

const port = process.env.APP_PORT || 4000

app.listen(port)
