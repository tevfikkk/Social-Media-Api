import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { Application } from 'express'
import helmet from 'helmet'

import { authRouter } from './controllers/auth'
import { commentRouter } from './controllers/comment'
import { postRouter } from './controllers/post'
import { info } from './utils/logger'
import {
  errorHandler,
  requestLogger,
  unknownEndpoint
} from './utils/middleware'

const app: Application = express()

info('Starting up server...')

// Middleware for protecting the server from attacks
app.use(helmet())

// Middlewares for logging requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(requestLogger)

// Cookie parser
app.use(cookieParser())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/comments', commentRouter)

// Error handling middlewares
app.use(errorHandler)
app.use(unknownEndpoint)

export default app
