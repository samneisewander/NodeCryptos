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
    created: String,
    hash: String,
    salt: String,
    username: String,
    grade: String,
    owner: Array, //list of nfts this person owns
    artist: Array, //list of nfts this person has made
    money: Number,
    offersIn: Array, //pending offers made on items this person owns
    offersOut: Array, //pending offers this person has made
    offersOld: Array
})
const cryptoSchema = new mongoose.Schema({
    approved: Boolean,
    name: String,
    artist: String,
    artistId: String, //we dont technically need this. usernames are unique, so the artist name is enough for a query.
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