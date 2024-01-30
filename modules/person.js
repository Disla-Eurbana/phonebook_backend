const mongoose = require('mongoose')

// if (process.argv.length < 3) {
//     console.log('give password as argument')
//     process.exit(1)
// }

// const password = process.argv[2]

// const url =
//     `mongodb+srv://deislaurbana:${password}@cluster0.3lhlqan.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
//console.log('connecting to', url)

mongoose.connect(url)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch((error) => {
		console.log('error connecting to MongoDB:', error.message)
	})

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: true
	},
	number: {
		type: String,
		validate: {
			validator: function(v) {
				return /\d{2,3}-\d{6}/.test(v)
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		required: [true, 'User phone number required']
	}
})
//used to return part of the data of the db
personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)