const path = require('path')
const router = require('express').Router()
const passport = require('passport')
const genPassword = require('../lib/passwordUtils').genPassword
const connection = require('../config/database')
const User = connection.models.User

router.post('/login', passport.authenticate('local'), (req, res) => {

})

router.post('/register', (req, res) => {
    const saltHash = genPassword(req.body.password)
    const newUser = new User({
        username: req.body.username,
        hash: saltHash.hash,
        salt: saltHash.salt
    })
    newUser.save().then(user => {console.log(user)})
    res.redirect('/login')
})

//Routes
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/register_temp.html'))
})

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/home.html'))
})

module.exports = router

/*
app.get('/approve', (req, res) => {
    const reject = () => {
        res.setHeader('www-authenticate', 'Basic')
        res.sendStatus(401)
    }

    const authorization = req.headers.authorization

    if (!authorization) {
        return reject()
    }

    const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

    if (!(username === process.env.ADMIN_ && password === process.env.ADMIN_PASS)) {
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
*/