const path = require('path')
const router = require('express').Router()
const passport = require('passport')
const genPassword = require('../lib/passwordUtils').genPassword
const protect = require('../lib/protect').protect
const connection = require('../config/database')
const User = connection.models.User
const Crypto = connection.models.Crypto

let debug = false; //weird res header duplicate bug. dunno where its coming from but it happens on homepage redirect to login 

//GET Routes (unprotected)

router.get('/register', (req, res) => {
    if (debug) console.log('get/register')
    res.sendFile(path.join(__dirname, '../pages/register_temp.html'))
})

router.get('/login', (req, res) => {
    if (debug) console.log('get/login')
    let err = req.flash().error
    try {
        if (err) res.redirect('/login?err=' + err[0])
        else res.sendFile(path.join(__dirname, '../pages/login.html'))
    }
    catch (err) { res.sendFile(path.join(__dirname, '../pages/login.html')) }
})

router.get('/cryptos', (req, res) => {
    if (debug) console.log('get/cryptos')
    Crypto.find({ approved: true }, (err, results) => {
        if (err) res.sendStatus(500)
        res.send(results)
    })
})

router.get('/user-obj', (req, res) => {
    if (debug) console.log('get/user-obj')
    if (req.user) res.send(req.user)
    else res.send('nopers no elpers')
})

//GET Routes (protected)
router.get('/approve', protect, (req, res) => {
    if (debug) console.log('get/approve')
    if (req.user.admin) res.sendFile(path.join(__dirname, '../pages/approve.html'))
    else res.sendStatus(403)

})

router.get('/create', protect, (req, res) => {
    if (debug) console.log('get/create')
    res.sendFile(path.join(__dirname, '../pages/create.html'))
})

router.get('/', protect, (req, res) => {
    if (debug) console.log('get/')
    res.sendFile(path.join(__dirname, '../pages/home.html'))
})

router.get('/inspect', protect, (req, res) => {
    if (debug) console.log('get/inspect')
    res.sendFile(path.join(__dirname, '../pages/inspect.html'))
})

//POST Routes 
router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }))

router.post('/register', (req, res) => {
    if (debug) console.log('post/register')
    //Redundant info eval just in case someone (colin) fucks with the clientside code
    if (req.body.username == '' || req.body.username.length > 18) return
    if (req.body.password.length < 8 || req.body.password.length > 50 || !(/\d/).test(req.body.password) || !(/[a-zA-Z]/).test(req.body.password)) return
    if (req.body.password !== req.body.password2) return
    if (!['Freshman', 'Sophmore', 'Junior', 'Senior'].includes(req.body.grade)) return

    //checks passed. 
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
        balance: 100,
        pfp: "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"
    })
    newUser.save().then(user => { console.log('[NEW USER] ' + user.username) })
    res.redirect('/login')
})

router.post('/username', (req, res) => {
    if (debug) console.log('post/username')
    User.findOne({ username: req.body.username })
        .then((result) => {
            if (result) res.send(false)
            else res.send(true)
        })
})


//POST Routes (protected)
router.post('/submit', protect, (req, res) => {
    if (debug) console.log('post/submit')
    const newCrypto = new Crypto({
        approved: false,
        name: req.body.name,
        artist: req.user.username,
        artistId: req.user._id,
        grade: req.user.grade,
        dat: req.body.dat,
        png: req.body.png,
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

router.post('/filter', protect, (req, res) => {
    if (debug) console.log('post/filter')
    switch (req.body.type) {
        case 'crypto':
            Crypto.find({ approved: false }, (err, results) => {
                if (err) res.sendStatus(500)
                res.send(results)
            })
            break
        case 'user':
            User.find({ approved: false }, (err, results) => {
                if (err) res.sendStatus(500)
                res.send(results)
            })
            break
    }
})

router.post('/approve', protect, (req, res) => {
    if (debug) console.log('post/approve')
    switch (req.body.type) {
        case 'crypto':
            if (req.body.approved) {
                User.count().exec(function (err, count) {
                    User.findOne().skip(Math.floor(Math.random() * count)).exec(
                        function (err, result) {
                            // result is a random user document (i hope)
                            Crypto.findOne({
                                approved: false,
                                name: req.body.crypto.name,
                                artist: req.body.crypto.artist,
                                grade: req.body.crypto.grade,
                                dat: req.body.crypto.dat
                            }).then(crypto => {
                                crypto.approved = true
                                crypto.owner = result.username
                                result.owner.push(crypto._id)
                                crypto.save()
                                result.save()
                            })
                            console.log('[CRYPTO APPROVED] ' + req.body.crypto.name, 'Awared to: ' + result.username)
                            res.sendStatus(200)
                        })
                })
            }
            else {
                Crypto.findOneAndDelete({
                    approved: false,
                    name: req.body.crypto.name,
                    artist: req.body.crypto.artist,
                    grade: req.body.crypto.grade,
                    dat: req.body.crypto.dat
                }, (err) => {
                    if (!err) {
                        console.log('[CRYPTO DENIED] ' + req.body.crypto.name)
                        res.sendStatus(200)
                    }
                    else res.sendStatus(500)
                })
            }
            break
        case 'user':
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
                        if (!err) {
                            console.log('[USER APPROVED] ' + req.body.user.username)
                            res.sendStatus(200)
                        }
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
                    if (!err) {
                        console.log('[USER DENIED] ' + req.body.user.username)
                        res.sendStatus(200)
                    }
                    else res.sendStatus(500)
                })
            }
            break
    }
})

router.post('/offer', protect, (req, res) => {
    if (debug) console.log('post/offer')
    class Offer {
        constructor(buyer, seller, amount, item) {
            this.buyer = buyer
            this.seller = seller
            this.amount = amount
            this.item = item
            this.created = Date.now()
            this.status = 'Pending'
        }
        reject() {
            User.findOne({ username: buyer.username }).then(user => {
                user.offersOut.forEach((offer, i) => {
                    if (offer == this) offer.status = 'Rejected'
                })
                user.save()
            })
            User.findOne({ username: seller.username }).then(user => {
                user.offersIn.forEach((offer, i) => {
                    if (offer == this) offer.status = 'Rejected'
                })
                user.save()
            })
            Crypto.findOne({ _id: item._id }).then(crypto => {
                crypto.events.forEach((event, i) => {
                    if (event == this) event.status = 'Rejected'
                })
                crypto.save()
            })
        }
        complete() {
            User.findOne({ username: buyer.username }).then(user => {
                user.offersOut.forEach((offer, i) => {
                    if (offer == this) {
                        offer.status = 'Complete'
                        user.offersOld.push(offer)
                        user.offersOut.splice(i, 1)
                    }
                })
                user.owner.push(this.item)
                user.save()
            })
            User.findOne({ username: seller.username }).then(user => {
                user.offersIn.forEach((offer, i) => {
                    if (offer == this) {
                        offer.status = 'Complete'
                        user.offersOld.push(offer)
                        user.offersIn.splice(i, 1)
                    }
                })
                user.owner.splice(user.owner.indexOf(this.item), 1)
                user.save()
            })
            Crypto.findOne({ _id: item._id }).then(crypto => {
                crypto.events.forEach((event, i) => {
                    if (event == this) {
                        event.status = 'Complete'
                        crypto.eventsOld.push(event)
                        crypto.events.splice(i, 1)
                    }
                })
                crypto.owner = this.buyer.username
                crypto.save()
            })
        }
        delete() {
            User.findOne({ username: buyer.username }).then(user => {
                user.offersOut.forEach((offer, i) => {
                    if (offer == this) user.offersOut.splice(i, 1)
                })
                user.save()
            })
            User.findOne({ username: seller.username }).then(user => {
                user.offersIn.forEach((offer, i) => {
                    if (offer == this) user.offersIn.splice(i, 1)
                })
                user.save()
            })
            Crypto.findOne({ _id: item._id }).then(crypto => {
                crypto.events.forEach((event, i) => {
                    if (event == this) crypto.events.splice(i, 1)
                })
                crypto.save()
            })
        }
    }
    let offer = new Offer(req.user, req.body.seller, req.body.amount, req.body.item)
    let error = false
    User.findOne({ username: req.user.username }).then((err, user) => {
        if (err) {
            error = true
            return
        }
        user.offersOut.push(offer)
        user.save()
    })
    User.findOne({ username: req.body.seller.username }).then((err, user) => {
        if (err) {
            error = true
            return
        }
        user.offersIn.push(offer)
        user.save()
    })
    Crypto.findOne({ _id: req.body.item._id }).then((err, crypto) => {
        if (err) {
            error = true
            return
        }
        crypto.events.push(offer)
        crypto.save()
    })
    if (error) {
        offer.delete()
        res.send({ err: true })
    }
    else res.send({ err: false, offer: offer })
})

module.exports = router