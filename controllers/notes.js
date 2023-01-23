const jwt = require('jsonwebtoken')
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async(request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async(request, response) => {
  const id = request.params.id
  const note = await Note.findById(id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.delete('/:id', async(request, response) => {
  const id = request.params.id
  await Note.findByIdAndRemove(id)
  response.status(204).end()
})

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    return authorization.substring(7)
  }
  return null
}

notesRouter.post('/', async(request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if(!decodedToken){
    return response.status(401).json({ erro: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  // the validator on the schema will handle the wrong content
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })
  const savedNote = await note.save()
  user.notes  = user.notes.concat(savedNote._id)
  await user.save()
  response.status(201).json(savedNote)

})

// by default the validator not run automatically in the findOneByIdAndUpdate so we will force it to work here
notesRouter.put('/:id', async(request, response) => {
  const id = request.params.id
  const { content, important } = request.body
  const updatedNote = await Note.findByIdAndUpdate(
    id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  ) // new is to returned the updated note not the original by default
  response.json(updatedNote)
})

module.exports = notesRouter
