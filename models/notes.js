const mongoose = require('mongoose');

const url = process.env.DB_URI
console.log("connecting to ", url);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(result => {
        console.log("connected to db");
    })
    .catch(error => {
        console.log("failed to connect to db", error.message);
    })


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
    important: Boolean
  })


// manage what will be returned to the client
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

  
module.exports = mongoose.model("Note", noteSchema);