const path = require('path')
const router = require('express').Router()
const passport = require('passport')
const genPassword = require('../lib/passwordUtils').genPassword
const connection = require('../config/database')
const User = connection.models.User
const Crypto = connection.models.Crypto

//GET Routes (unprotected)
router.get('/username', (req, res) => {
    User.findOne({ username: req.body.username })
        .then(result => {
            if (result) res.send(false)
            else res.send(true)
        })
})

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/register_temp.html'))
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/login_temp.html'))
})

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/home.html'))
})

router.get('/cryptos', (req, res) => {
    Crypto.find({ approved: false }, (err, results) => {
        if (err) res.sendStatus(500)
        res.send(results)
    })
})

router.get('/filter/cryptos', (req, res) => {
    Crypto.find({ approved: false }, (err, results) => {
        if (err) res.sendStatus(500)
        res.send(results)
    })
})

router.get('/filter/users', (req, res) => {
    User.find({ approved: false }, (err, results) => {
        if (err) res.sendStatus(500)
        res.send(results)
    })
})

//GET Routes (protected)
router.get('/approve', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.admin) res.sendFile(path.join(__dirname, '../pages/approve.html'))
        else res.sendStatus(403)
    }
    else res.redirect('/login')
})

router.get('/create', (req, res) => {
    if (req.isAuthenticated()) res.sendFile(path.join(__dirname, '../pages/create.html'))
    else res.redirect('/login')
})

//POST
router.post('/login', passport.authenticate('local', { successRedirect: '/' }))

router.post('/register', (req, res) => {
    User.find({ username: req.body.username })
        .then(results => {
            if (req.body.password !== req.body.password2) {
                res.redirect('/register?err=password')
                return
            }
            if (results.length > 0) {
                res.redirect('/register?err=username')
                return
            }

            const saltHash = genPassword(req.body.password)
            const newUser = new User({
                approved: false,
                admin: false,
                created: Date.now(),
                username: req.body.username,
                grade: req.body.grade,
                hash: saltHash.hash,
                salt: saltHash.salt,
                owner: [],
                artist: [],
                money: 100
            })
            newUser.save().then(user => { console.log('[NEW USER] ' + user.username) })
            res.redirect('/login')
        })

})

router.post('/submit', (req, res) => {
    const newCrypto = new Crypto({
        approved: false,
        name: req.body.name,
        artist: req.user.username,
        artistId: req.user._id,
        grade: req.user.grade,
        dat: req.body.dat,
        owner: null,
        value: 0,
        events: []
    })
    newCrypto.save((err, result) => {
        console.log('[NEW CRYPTO] ' + result.name)
        User.findById(req.user._id)
            .then(user => {
                //this should probably happen after the crypto is approved
                user.artist.push(result._id)
                user.save()
            })
    })

    res.sendStatus(200)
})

router.post('/approve/crypto', (req, res) => {
    if (req.body.approved) {
        Crypto.findOneAndUpdate({
            approved: false,
            name: req.body.item.name,
            artist: req.body.item.artist,
            grade: req.body.item.grade,
            dat: req.body.item.dat
        },
            {
                approved: true
            }, (err) => {
                if (!err) res.sendStatus(200)
                else res.sendStatus(500)
            })
    }
    else {
        Crypto.findOneAndDelete({
            approved: false,
            name: req.body.item.name,
            artist: req.body.item.artist,
            grade: req.body.item.grade,
            dat: req.body.item.dat
        }, (err) => {
            if (!err) res.sendStatus(200)
            else res.sendStatus(500)
        })
    }
})

router.post('/approve/user', (req, res) => {
    if (req.body.approved) {
        User.findOneAndUpdate({
            approved: false,
            username: req.body.user.username,
            grade: req.body.user.grade,
            hash: req.body.user.hash,
            salt: req.body.user.salt
        },
            {
                approved: true
            }, (err) => {
                if (!err) res.sendStsatus(200)
                else res.sendStatus(500)
            })
    }
    else {
        User.findOneAndDelete({
            approved: false,
            username: req.body.user.username,
            grade: req.body.user.grade,
            hash: req.body.user.hash,
            salt: req.body.user.salt
        }, (err) => {
            if (!err) res.sendStatus(200)
            else res.sendStatus(500)
        })
    }
})

module.exports = router