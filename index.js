//this is the backend for the phonebok app
//to get the front end inside the backend, you need to build the frontend and inlude the dist folder here
//you can do it with the following command
//put in package.json: "build:ui": "rm -rf dist && cd ../../React\\ course\\ helsinki/phonebook && npm run build && cp -r dist ../../Github/phonebook_backend"
// 1. rm -rf dist -> remove the existong dist folder in this repository
// 2. cd ../../React\\ course\\ helsinki/phonebook -> navigate to the forntend folder
// 3. npm run build -> run the build of the front end to build the dist folder
// 4. cp -r dist ../../Github/phonebook_backend -> copy the dist folder into this repository
// -> "build:ui": "rm -rf dist && cd ../../React\\ course\\ helsinki/phonebook && npm run build && cp -r dist ../../Github/phonebook_backend"
require('dotenv').config() //file that contains sensitive info, also put this file in gitignored to not upload to github
const express = require('express')
const morgan = require('morgan')
const cors = require('cors') //make it posible to access the backend from other origin (cross origin ...)
const Person = require('./modules/person')
const app = express()

const requestLogger = (request, response, next) => {
    console.log('---')
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

//the app.use are called in order with a reason
app.use(express.static('dist')) //to include the frontend code that is in the dist file

app.use(express.json())

app.use(cors()) //makes it posible to access the backend from other origin
//if this isnt set, you can only access the backend if it is hosted with the same origin
//for example now backend runs on localhost:3001 and the forntend on vital localhost:5173 -> which is not the same origin

app.use(requestLogger) //after express.json becasue otherwise the body of the request would be undefined (express.json handles the body of request to json)

//morgan is used to log requests to the console
morgan.token('req-body', function (req, res) {
    return JSON.stringify(req.body);
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body -------'))

// let persons = [
//     {
//         "id": 1,
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": 2,
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": 3,
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": 4,
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    //response.json(persons)
    Person.find({})
        .then(result => {
            response.json(result)
        })
})

// app.get('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     const person = persons.find(person => id === person.id)
//     if (person) {
//         response.json(person)
//     }
//     else {
//         response.status(404).end()
//     }

// })
app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            }
            else{
                response.status(404).end()
            }
            
        })
        .catch(error => next(error))
})

// app.get('/info', (request, response) => {
//     response.send(
//         `<p>The phonebook has info for ${persons.length} people</p>
//        <p>${new Date()}</p>`
//     )
// })
app.get('/info', (request, response) => {
    Person.find({})
        .then(result => {
            //console.log(result)
            response.send(
                `<p>The phonebook has info for ${result.length} people</p>
                <p>${new Date()}</p>`
            )
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // //console.log(persons)
    // response.status(204).end()
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// const generateId = () => {
//     return Math.random() * 1000
// }
// app.post('/api/persons', (request, response) => {
//     const body = request.body
//     const id = generateId()
//     //console.log(body)

//     if (!body.name || !body.number) {
//         return response.status(400).json({
//             error: "empty body"
//         })
//     }

//     const existing = persons.filter(person => person.name === body.name)
//     //console.log(existing)
//     if (existing.length > 0) {
//         return response.status(400).json({
//             error: "Person already created"
//         })
//     }

//     const person = {
//         name: body.name,
//         number: body.number,
//         id: id
//     }
//     persons = persons.concat(person)

//     response.json(person)
// })

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (body.name === undefined || body.number === undefined) {
    //     return response.status(400).json({ error: 'content missing' })
    // } -> validation is handeled by the schema (person.js)

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})
app.put('/api/persons/:id', (request,response,next) => {
    const body = request.body
    console.log(body)

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id,person,{new : true})
        .then(update => {
            response.json(update)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
//unknown endpeoint should be 1 to last app.use
app.use(unknownEndpoint)

//gets data from the next(error) in the try catch blocks
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if(error.name === 'ValidationError'){
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
//error should always be the last app.use
app.use(errorHandler)

const PORT = process.env.PORT //Fly.io and Render configure the application port based on that environment variable
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})