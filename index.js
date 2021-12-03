const fs = require('fs')
const express = require('express')
const app = require('express')()

app.use('/lib', express.static('lib'))
app.use('/scripts', express.static('scripts'))
app.use('/pages', express.static('pages'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/home.html')
  console.log('Request for /home')
})

app.get('/cryptos', (req, res) => {
  res.send(fs.readFileSync('./lib/cryptos.json'))
})

app.get('/create', (req, res) => {
  res.sendFile(__dirname + '/pages/create.html')
  console.log('Request for /create')
})

app.get('/image', (req, res) => {
  res.send(base64_encode(__dirname + '/lib/' + req.query.src))
})

function base64_encode(file){
  //read binary
  var bitmap = fs.readFileSync(file)
  //convert binary to base64
  return Buffer.from(bitmap).toString('base64')
}

app.listen(3000)