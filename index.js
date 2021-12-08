const fs = require('fs')
const express = require('express')
const app = require('express')()
const mongoose = require('mongoose')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuthStrat

async function connect(){
  await mongoose.connect('mongodb+srv://Amogus:sussybaka123@susamongus.z0fzu.mongodb.net/SusAmongus?retryWrites=true&w=majority')
  const userSchema = new mongoose.Schema({
    name: String,
    owns: Array,
    author: Array
  })
  const cryptoSchema = new mongoose.Schema({
    name: String,
    artist: String,
    grade: Number,
    dat: Object
  })
  const User = mongoose.model('User', userSchema)
  const Crypto = mongoose.model('Crypto', cryptoSchema)

  const sam = new User({
    name: "Sam Neisewander",
    owns: [],
    author: []
  })
  await sam.save()
}

app.use('/lib', express.static('lib'))
app.use('/scripts', express.static('scripts'))
app.use('/pages', express.static('pages'))

app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/home.html')
})

app.get('/approve', (req, res) => {
  const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }

  const authorization = req.headers.authorization

  if(!authorization) {
    return reject()
  }

  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

  if(! (username === 'sus' && password === 'amogus')) {
    return reject()
  }
  res.sendFile(__dirname + '/pages/approve.html')
})

app.get('/cryptos', (req, res) => {
  res.send(fs.readFileSync('./lib/cryptos.json'))
})

app.get('/filter', (req, res) => {
  res.send(fs.readFileSync('./lib/filter.json'))
})

app.get('/create', (req, res) => {
  res.sendFile(__dirname + '/pages/create.html')
})

app.post('/submit', (req, res) => {
  let arr = JSON.parse(fs.readFileSync('./lib/filter.json'))
  arr.push(req.body)
  fs.writeFile("./lib/filter.json", JSON.stringify(arr), (err) => {
    if (err) throw err
    console.log('Submission Recieved: ' + req.body.name)
  })
  res.sendStatus(200)
})

app.post('/approve', (req, res) => {
  let arr = JSON.parse(fs.readFileSync('./lib/cryptos.json'))
  if (req.body.approved == true) {
    arr.push(req.body.item)
    fs.writeFile("./lib/cryptos.json", JSON.stringify(arr), (err) => {
      if (err) throw err
      console.log('Submission Approved: ' + req.body.item.name)
    })
  }
  fs.writeFile("./lib/filter.json", JSON.stringify(req.body.data), (err) => {
    if (err) throw err
    if (req.body.item.name) console.log('Submission Denied: ' + req.body.item.name)
  })
  
  res.sendStatus(200)
})

app.listen(3000)