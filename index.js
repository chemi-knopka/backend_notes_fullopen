require('dotenv').config();
const { response } = require("express");
const express = require("express");
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const Note = require('./models/notes') // db model



// -- middlewares
app.use(express.static('build'))
app.use(morgan('tiny'))
app.use(express.json());
app.use(cors());

app.get("/api/notes", (req, res) => {
    Note.find({}).then(result => {
      res.json(result);
    })
});

app.post('/api/notes', (req, res, next) => {
  const body = req.body


  if (!body.content){
    return res.status(400).json({error: "missing content"});
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  // save note to db 
  note
    .save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormatedNote => {
      console.log("note is saved in db");
      res.json(savedAndFormatedNote);
    })
    .catch(error => next(error))
});

app.get('/api/notes/:id', (req, res, next) => {
   Note.findById(req.params.id)
      .then(note => {
          if (note){
            res.json(note)
          } else {
            res.status(404).end();
          }
      })
      .catch(error => next(error))
});

app.delete('/api/notes/:id', (req, res, next) => {
    Note.findByIdAndRemove(req.params.id)
      .then(note => {
        res.status(204).end()
      })
      .catch(err => next(err))
})

app.put('/api/notes/:id', (request, response, next) => {
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

// error handler middleware 
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  // check if id of the note is valid
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === "ValidationError"){
    // check if al validations are setisfite during save document to db
    return response.status(400).json({ error: error.message });
  } 

  next(error)
}


app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})