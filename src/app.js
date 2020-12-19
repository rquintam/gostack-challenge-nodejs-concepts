const express = require('express')
const cors = require('cors')
const { v4: uuid, validate: isUuid } = require('uuid')

const app = express()
const repositories = []

// MIDDLEWARE to show log requests
function logRequests(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel)
  next()
  console.timeEnd(logLabel)
}

// MIDDLEWARE to validate ID 
function validateId(request, response, next) {
  const { id } = request.params

  return (isUuid(id))
    ? next()
    : response.status(400).json({ error: '⚠️ Invalid repository ID!' })
}

// FORCE EXPRESS READ JSON 
app.use(express.json(), cors(), logRequests)
// CHECK IF ID IS VALID AND EXISTS
app.use('/repositories/:id', validateId)

// POST /repositories
app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository)

  return response.json(repository)
})

// GET /repositories
app.get('/repositories', (request, response) => {
  return response.json(repositories)
})

// PUT /repositories/:id
app.put('/repositories/:id', (request, response) => {
  const { id } = request.params
  const repoIndex = repositories.findIndex(repository => repository.id === id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: '⚠️ Repository not found!' })
  }

  const { title, url, techs } = request.body
  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repoIndex].likes
  }

  repositories[repoIndex] = repository

  return response.json(repository)
})

app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params
  const repoIndex = repositories.findIndex(repository => repository.id === id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: '⚠️ Repository not found!' })
  }

  repositories.splice(repoIndex, 1)

  return response.status(204).send()
})

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params
  const repoIndex = repositories.findIndex(repository => repository.id === id)

  if (repoIndex < 0) {
    return response.status(400).json({ error: '⚠️ Repository not found!' })
  }

  const repository = repositories[repoIndex]

  repository.likes++

  return response.json(repository)
})

module.exports = app
