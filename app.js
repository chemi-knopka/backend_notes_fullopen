const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const notesRouter = require('./controlers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

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

app.use('/api/notes', notesRouter) // related pathes 

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

// -- export
module.exports = app