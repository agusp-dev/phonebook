const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', (request, response) => {
  return request?.method === 'POST' ? JSON.stringify(request?.body) : ''
})

app.use( morgan(':method :url :status :res[content-length] - :response-time ms :body') )

let { persons } = require('./persons')

const generateId = () => Math.floor(Math.random() * 1000)

const isNameDuplicated = (name) => {
  if (!persons?.length) return false
  return persons?.find(p => p?.name?.toLowerCase() === name.toLowerCase())
}

app.get('/api/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons?.length} persons</p>
    <p>${new Date()}</p>
  `)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const personId = Number(request?.params?.id)
  const person = persons?.find(({ id }) => personId === id )
  return person 
    ? response.json(person) 
    : response.status(404).send('Persona no encontrada')
})

app.delete('/api/persons/:id', (request, response) => {
  const personId = Number(request?.params?.id)
  persons = persons?.filter(({ id }) => personId !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request?.body

  if (!body?.name || !body?.number) {
    return response.status(400).send('Params missing')
  }

  if (isNameDuplicated(body.name)) {
    return response.status(400).send('Name must be unique')
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons?.concat(person)
  
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
