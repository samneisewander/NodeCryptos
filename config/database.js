const mongoose = require('mongoose')

require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI).then((conn, err) => {
    if (err) console.log('[mongoose] Connection failure.', err)
    else console.log('[mongoose] Connection successful!')
})

const userSchema = new mongoose.Schema({
    //HEY! Really important that you don't rename these once the site is live. If you do, any user records will still have their metadata recorded under the OLD NAMES. You'll have to find a way to update the docs to the new schema if you decide to rename stuff. So. Good luck.
    approved: Date, //whether or not this user has been manually permitted to use the site by an admin. Null if no, Date obj if yes
    admin: Boolean, //whether or not this user has elevated permissions for certain pages.
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
    currentProjectData: Array //Pixel color data for user's last saved project
})
const cryptoSchema = new mongoose.Schema({
    //need to comment this shizzle up
    approved: Date, //Date this crypto was approved
    name: String,
    artist: String, //username of artist
    artistId: String,
    grade: String,
    dat: Object,
    png: String,
    owner: String, //username of owner
    ownerId: String,
    value: Number,
    events: Array, //active events 
    eventsOld: Array, //
    trades: Number //number of times this crypto has been traded
})
const auctionSchema = new mongoose.Schema({
    created: Date,
    expires: Date,
    crypto: Object,
    value: Number,
    winner: Object,
    open: Boolean
})



mongoose.model('User', userSchema)
mongoose.model('Crypto', cryptoSchema)
mongoose.model('Auction', auctionSchema)

module.exports = mongoose.connection