import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import json from 'koa-json'
import authRoutes from './routes/auth.js'
import reportsRoutes from './routes/reports.js'

const app = new Koa()

app.use(cors())
app.use(bodyParser())
app.use(json())
app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
app.use(reportsRoutes.routes()).use(reportsRoutes.allowedMethods())

const PORT = 4001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
