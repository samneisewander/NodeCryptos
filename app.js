//Modules
require('dotenv').config()
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

//Init Application / Set Session Store
const MongoStore = require('connect-mongo')
const app = require('express')()

//Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/lib', express.static('lib'))
app.use('/scripts', express.static('scripts'))
app.use('/pages', express.static('pages'))
app.use('/images', express.static('images'))
app.use(session({
  //https://www.npmjs.com/package/express-session
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: 'Amongsus',
    autoRemove: 'native'
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60
  }
}))
app.use(flash())

//Passport
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

//Routes
const routes = require('./routes/index.js')
app.use(routes)

//Listen
app.listen(3000)