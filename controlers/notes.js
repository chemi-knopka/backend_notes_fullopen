const notesRouter = require('express').Router()
const logger = require('../utils/logger')
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('express-async-errors')

notesRouter.get('/', async (req, res, next) => {
  const notes = await Note
    .find({})
    .populate('user', { username: 1, name: 1 })
  res.json(notes)
})
  
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}


notesRouter.post('/', async (req, res, next) => {
  const body = req.body

  // get user token from header
  const token = getTokenFrom(req)
  // decode token it will return object of the username and id fields
  const decodedToken = jwt.verify(token, process.env.SECRET)

  // if token missing or not provided return 401 error 
  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  // once we decoded the token we have id of the username
  const user = await User.findById(decodedToken.id)

  
  // create new Note from request
  let note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    date: new Date(),
    user: user._id
  })
  
  // save note with the user
  const savedNote = await note.save()
  // add saved note id in user document
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  res.json(savedNote)
})

notesRouter.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id)
  
  if (note){
    res.json(note)
  } else {
    res.status(404).end()
  }    
})


notesRouter.delete('/:id', async (req, res, next) => {
  const note = await Note.findByIdAndRemove(req.params.id)    
  res.status(204).end()
})
  
notesRouter.put('/:id', (request, response, next) => {
  const body = request.body
  
  const note = {
    content: body.content,
    important: body.important
  }
  
  Note.findByIdAndUpdate(request.params.id, note, {new: true})
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(err => next(err))
})


  
module.exports = notesRouter