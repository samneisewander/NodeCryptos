const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI)
    .then((conn, err) =>{
        if (err) console.log('[mongoose] Connection failure.', err)
        else console.log('[mongoose] Connection successful!')
    })

const userSchema = new mongoose.Schema({
    approved: Boolean,
    admin: Boolean,
    created: Date, 
    hash: String,
    salt: String,
    username: String,
    grade: String,
    owner: Array, //list of nfts this person owns
    artist: Array, //list of nfts this person has made
    money: Number,
    offersIn: Array, //pending offers made on items this person owns
    offersOut: Array, //pending offers this person has made
    offersOld: Array,
    pfp: String, //profile picture; base64 encoded png
    swatches: Array //swatches this user has used before
})
const cryptoSchema = new mongoose.Schema({
    approved: Boolean,
    name: String,
    created: Date,
    artist: String,
    grade: String,
    dat: Object,
    png: String,
    owner: String,
    value: Number,
    events: Array,
    eventsOld: Array
})

mongoose.model('User', userSchema)
mongoose.model('Crypto', cryptoSchema)

module.exports = mongoose.connection