//Modules
require('dotenv').config()
const fs = require('fs')
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const crypto = require('crypto')
const passport = require('passport')

//Init Application / Set Session Store
const MongoStore = require('connect-mongo')
const app = require('express')()

//Routes
const routes = require('./routes/index.js')
app.use(routes)

//Middleware
app.use('/lib', express.static('lib'))
app.use('/scripts', express.static('scripts'))
app.use('/pages', express.static('pages'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  //https://www.npmjs.com/package/express-session
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: 'Amongsus',
    autoRemove: 'native'
  }),
  cookie: { 
    maxAge: 1000 * 60,
  }
}))

//Passport
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

//Listen
app.listen(3000)