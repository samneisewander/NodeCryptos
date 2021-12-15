const mongoose = require('mongoose')

require('dotenv').config()

//db not working lolz

const connection = mongoose.createConnection(process.env.MONGODB_URI, {
    //read wtf this does lol
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    hash: String,
    salt: String
    // owns: Array,
    // author: Array,
    // money: Number
})
const cryptoSchema = new mongoose.Schema({
    name: String,
    artist: String,
    grade: Number,
    dat: Object,
    owner: Object,
    value: Number,
    events: Array
})

const User = mongoose.model('User', userSchema)
const Crypto = mongoose.model('Crypto', cryptoSchema)

module.exports = connection