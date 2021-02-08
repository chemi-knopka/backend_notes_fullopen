const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
// require('express-async-errors')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })

  
  const passwordCorrect = user === null 
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  // if user name is not registered return 
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password!'
    })
  }

  // if a user is registered create token for him
  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .json({ token, username: user.username, name: user.name })
})

module.exports = loginRouter