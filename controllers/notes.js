const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async(request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

notesRouter.get('/:id', async(request, response, next) => {
  const id = request.params.id
  try {
    const note = await Note.findById(id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

notesRouter.delete('/:id', async(request, response, next) => {
  const id = request.params.id
  try {
    await Note.findByIdAndRemove(id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

notesRouter.post('/', async(request, response, next) => {
  const body = request.body
  // the validator on the schema will handle the wrong content
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })
  try {
    const savedNote = await note.save()
    response.status(201).json(savedNote)
  } catch (exception) {
    next(exception)
  }
})

// by default the validator not run automatically in the findOneByIdAndUpdate so we will force it to work here
notesRouter.put('/:id', async(request, response, next) => {
  const id = request.params.id
  const { content, important } = request.body
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { content, important },
      { new: true, runValidators: true, context: 'query' }
    ) // new is to returned the updated note not the original by default
    response.json(updatedNote)
  } catch (exception) {
    next(exception)
  }
})

module.exports = notesRouter
