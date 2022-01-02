const path = require('path')
const router = require('express').Router()
const passport = require('passport')
const genPassword = require('../lib/passwordUtils').genPassword
const protect = require('../lib/protect').protect
const connection = require('../config/database')
const User = connection.models.User
const Crypto = connection.models.Crypto

//GET Routes (unprotected)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/home.html'))
})

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/register_temp.html'))
})

router.get('/login', (req, res) => {
    let err = req.flash().error
    try { 
        if (err) res.redirect('/login?err=' + err[0])
        else res.sendFile(path.join(__dirname, '../pages/login.html'))
    }
    catch (err) { res.sendFile(path.join(__dirname, '../pages/login.html')) }
})

router.get('/cryptos', (req, res) => {
    Crypto.find({ approved: true }, (err, results) => {
        if (err) res.sendStatus(500)
        res.send(results)
    })
})

//GET Routes (protected)
router.get('/approve', protect, (req, res) => {
    if (req.user.admin) res.sendFile(path.join(__dirname, '../pages/approve.html'))
    else res.sendStatus(403)
    
})

router.get('/create', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/create.html')) 
})

//POST Routes 
router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }))

router.post('/register', (req, res) => {
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
        money: 100
    })
    newUser.save().then(user => { console.log('[NEW USER] ' + user.username) })
    res.redirect('/login')
})

router.post('/username', (req, res) => {
    User.findOne({ username: req.body.username })
        .then((result) => {
            if (result) res.send(false)
            else res.send(true)
        })
})


//POST Routes (protected)
router.post('/submit', protect, (req, res) => {
    if (!req.isAuthenticated()) res.redirect('/login')
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

router.post('/filter', protect, (req, res) => {
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
    switch (req.body.type) {
        case 'crypto':
            if (req.body.approved) {
                Crypto.findOneAndUpdate({
                    approved: false,
                    name: req.body.crypto.name,
                    artist: req.body.crypto.artist,
                    grade: req.body.crypto.grade,
                    dat: req.body.crypto.dat
                },
                    {
                        approved: true
                    }, (err) => {
                        if (!err) {
                            console.log('[CRYPTO APPROVED] ' + req.body.crypto.name)
                            res.sendStatus(200)
                        }
                        else res.sendStatus(500)
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
    class Offer{
        constructor(buyer, seller, amount, item){
            this.buyer = buyer
            this.seller = seller
            this.amount = amount
            this.item = item
            this.created = Date.now()
            this.status = 'Pending'
        }
        reject(){
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
        complete(){
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
        delete(){
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