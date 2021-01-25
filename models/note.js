const mongoose = require('mongoose')


// schema and model for notes
const noteSchema = mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'User'
  }
})


// manage what will be returned to the client
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

  
module.exports = mongoose.model('Note', noteSchema)