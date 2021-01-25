const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const allUsers = await User.find({})
  response.json(allUsers)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRound = 10 
  const passwordHash = await bcrypt.hash(body.password, saltRound)

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  const savedUser = await newUser.save()

  response.json(savedUser)
})


module.exports = usersRouter