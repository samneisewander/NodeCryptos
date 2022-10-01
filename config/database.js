const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI)
    .then((conn, err) =>{
        if (err) console.log('[mongoose] Connection failure.', err)
        else console.log('[mongoose] Connection successful!')
    })

const userSchema = new mongoose.Schema({
    //HEY! Really important that you don't rename these once the site is live. If you do, any user records will still have their metadata recorded under the OLD NAMES. You'll have to find a way to update the docs to the new schema if you decide to rename stuff. So. Good luck.
    approved: Boolean, //whether or not this user has been manually permitted to use the site by an admin.
    admin: Boolean, //whether or not this user has elevated permissions for certain pages.
    created: Date, //encoded in a really weird format. needs a special function to format for display.
    hash: String, //cryptography stuff
    salt: String, //cryptography stuff
    username: String, //display name
    grade: String, //Freshman, Sophomore, Junior, Senior
    owner: Array, //list of nfts this person owns
    artist: Array, //list of nfts this person has made
    balance: Number, //money
    offersIn: Array, //pending offers made on items this person owns
    offersOut: Array, //pending offers this person has made
    offersOld: Array, //old offer events i guess
    pfp: String, //profile picture; base64 encoded png
    swatches: Array //swatches this user has used before
})
const cryptoSchema = new mongoose.Schema({
    //need to comment this shizzle up
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