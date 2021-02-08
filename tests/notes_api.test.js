const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Note = require('../models/note')
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await Note.deleteMany({})

  for (let note of helper.initialNotes){
    let noteObject = new Note(note)
    await noteObject.save()
  }
})

// when there are some note on the path
describe('when there are some notes saved', () => {
  test('note are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
          
  })
  
  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    expect(response.body).toHaveLength(helper.initialNotes.length)
  })
  
  test('Specific note is within returned notes', async () => {
    const response = await api.get('/api/notes')
  
    const contents = response.body.map(r => r.content)
    expect(contents).toContain(
      'Browser can execute only Javascript'
    )
  })  
})

// view specific note
describe('viewing specific note', () => {
  test('a specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()
  
    const noteToView = notesAtStart[0]
  
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
    
    expect(resultNote.body).toEqual(processedNoteToView)
  })
  
  // nonexisting id
  test('note with valid but nonExisting id will give 404 error', async() => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNonExistingId}`)
      .expect(404)
  })

  // malformatted id
  test('fails if with 400 if id is not valid', async () => {
    const notValidId = 'alsdkjfa;lsdjf'

    await api
      .get(`/api/notes/${notValidId}`)
      .expect(400)
  })
})

// adding new note in the db
describe('addition of new note in ', () => {
  test('valid note can be added', async () => {
    const newNote = {
      content: 'async/await is makes code more readable',
      important: true
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
  
    const contents = notesAtEnd.map(r => r.content)
    expect(contents).toContain(
      'async/await is makes code more readable'
    )
  })
  
  test('note without content will not be saved in database', async () => {
    const newNote = {
      important: true
    }
  
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)
  
    const notesAtEnd = await helper.notesInDb()
  
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})

// deleting a note
describe('deleteing notes', () => {
  test('specific note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]
  
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)
  
    const notesAtEnd = await helper.notesInDb()
  
    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length - 1
    )
  
    const contents = notesAtEnd.map(r => r.content)
    expect(contents).not.toContain(noteToDelete.content)
  })  
})


describe('when there is one initial username in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({username: 'root', passwordHash})

    await user.save()
  })

  test('creating successeds with fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'shotius', 
      name: 'shota',
      password: 'secret'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test.only('creation fails with proper status code and a message if username is already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'superuser',
      passowrd: 'doesn\'t matter' 
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})



afterAll(() => {
  mongoose.connection.close()
}) 