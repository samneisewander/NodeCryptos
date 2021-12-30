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
    owner: Array,
    artist: Array,
    money: Number
})
const cryptoSchema = new mongoose.Schema({
    approved: Boolean,
    name: String,
    artist: String,
    artistId: String,
    grade: String,
    dat: Object,
    owner: Object,
    value: Number,
    events: Array
})

const User = mongoose.model('User', userSchema)
const Crypto = mongoose.model('Crypto', cryptoSchema)

module.exports = mongoose.connection