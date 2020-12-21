require('dotenv').config();
const { response } = require("express");
const express = require("express");
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const Note = require('./models/notes') // db model

// -- middlewares
app.use(morgan('tiny'))
app.use(express.json());
app.use(cors());
app.use(express.static('build'))

app.get("/api/notes", (req, res) => {
        
    Note.find({}).then(result => {
      res.json(result);
    })

});

app.get('/api/notes/:id', (req, res) => {
   Note.findById(req.params.id).then(foundNote => {
     res.json(foundNote)
   })
});

app.delete('/api/notes/:id', (req, res) => {
    Note.findByIdAndDelete(req.params.id).then(note => {
      res.json(note)
    })
})

app.post('/api/notes', (req, res) => {
  const body = req.body

  if (!body.content){
    return res.status(400).json({error: "missing content"});
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    console.log("note is saved");
    res.json(savedNote)
  })
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})