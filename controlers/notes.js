const notesRouter = require('express').Router()
const logger = require('../utils/logger')
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (req, res, next) => {
  const notes = await Note
    .find({})
    .populate('user', { username: 1, name: 1 })
  res.json(notes)
})
  
notesRouter.post('/', async (req, res, next) => {
  const body = req.body
  
  const user = await User.findById(body.userId)

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