const notesRouter = require('express').Router()
const Note = require('../models/note')
const logger = require('../utils/logger')


notesRouter.get('/', async (req, res, next) => {
  const notes = await Note.find({})
  res.json(notes)
})
  
notesRouter.post('/', async (req, res, next) => {
  const body = req.body
  
  // create new Note from request
  let note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })
    
  const savedNote = await note.save()
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