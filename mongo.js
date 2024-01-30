const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('pass the password')
	process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://deislaurbana:${password}@phonebook.1uscidb.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', noteSchema)

//creating persons
const addPerson = (name, number) => {
	const person = new Person({
		name: name,
		number: number,
	})

	person.save().then(result => {
		console.log(`${name} with number, ${number}, is saved to the phonebook`)
		mongoose.connection.close()
	})
}

const getAll = () => {
	Person.find({})
		.then(result => {
			let string = 'Phonebook: \n'
			result.map(person => {
				//console.log(person)
				string += `${person.name} ${person.number} \n`
			})
			console.log(string)
			mongoose.connection.close()
		})
}

if (process.argv.length === 5) {
	const name = process.argv[3]
	const number = process.argv[4]
	addPerson(name, number)
}
else if (process.argv.length < 5 && process.argv.length > 3) {
	console.log('the name or the number is missing')
	process.exit(1)
}
else {
	//return all items in collection
	getAll()
}

