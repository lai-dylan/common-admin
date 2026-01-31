import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import json from 'koa-json'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import roleRoutes from './routes/roles.js'
import contentRoutes from './routes/content.js'
import dashboardRoutes from './routes/dashboard.js'

const app = new Koa()

app.use(cors())
app.use(bodyParser())
app.use(json())
app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
app.use(userRoutes.routes()).use(userRoutes.allowedMethods())
app.use(roleRoutes.routes()).use(roleRoutes.allowedMethods())
app.use(contentRoutes.routes()).use(contentRoutes.allowedMethods())
app.use(dashboardRoutes.routes()).use(dashboardRoutes.allowedMethods())

const PORT = 4001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
