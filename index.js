// make the .env file availabel with the process.env
require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

const url = process.env.MONGODB_URI
const PORT = process.env.PORT

const Note = require('./models/note')

// let notes = [
//   {
//     id: 1,
//     content: 'HTML is easy',
//     date: '2022-05-30T17:30:31.098Z',
//     important: true,
//   },
//   {
//     id: 2,
//     content: 'Browser can execute only Javascript',
//     date: '2022-05-30T18:39:34.091Z',
//     important: false,
//   },
//   {
//     id: 3,
//     content: 'GET and POST are the most important methods of HTTP protocol',
//     date: '2022-05-30T19:20:14.298Z',
//     important: true,
//   },
//   {
//     id: 4,
//     content: 'Test auto deploy with git push',
//     date: '2023-01-13T19:20:14.298Z',
//     important: true,
//   },
// ]

app.get('/', (request, response) => {
  response.send('<h1>Hello world!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id)
    .then((note) => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(400).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  // the validator on the schema will handle the wrong content
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error))
})

// by default the validator not run automatically in the findOneByIdAndUpdate so we will force it to work here
app.put('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  const { content, important } = request.body

  Note.findByIdAndUpdate(
    id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  ) // new is to returned the updated note not the original by default
    .then((updatedNote) => {
      response.json(updatedNote)
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// custom error handler
const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

console.log('connecting to ', url)
mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`)
    })
  })
  .catch((err) => {
    console.log('error connecting to MongoDB: ', err.message)
  })
