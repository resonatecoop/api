import dotenv from 'dotenv-safe'
import app from './src/index.mjs'

dotenv.config()

const port = process.env.APP_PORT || 4000

app.listen(port)
