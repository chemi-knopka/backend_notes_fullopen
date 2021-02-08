const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const express = require('express')
const app = express()
const middleware = require('./utils/middleware')
const notesRouter = require('./controlers/notes')
const usersRouter = require('./controlers/users')
const loginRouter = require('./controlers/login')

const cors = require('cors')
require('express-async-errors')

// -- estamlishing DB connection
logger.info('connecting to MongoDB')

mongoose.connect(config.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('failed to connect to db', error.message)
  })


// -- register middlewares
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter) // notes related pathes 
app.use('/api/users', usersRouter) // users related pathes
app.use('/api/login', loginRouter) // user login path

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controlers/testing')
  app.use('/api/testing/', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// -- export
module.exports = app