const path = require('path')
const router = require('express').Router()
const passport = require('passport')
const genPassword = require('../lib/passwordUtils').genPassword
const protect = require('../lib/protect').protect
const connection = require('../config/database')
const { query } = require('express')
const { resolve } = require('path')
require('dotenv').config()
const User = connection.models.User
const Crypto = connection.models.Crypto
const Auction = connection.models.Auction

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
        if (err) res.sendStatus(500); return;
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

router.get('/market', protect, (req, res) => {
    if (debug) console.log('get/market')
    res.sendFile(path.join(__dirname, '../pages/market.html'))
})

router.get('/wallet', protect, (req, res) => {
    if (debug) console.log('get/wallet')
    res.sendFile(path.join(__dirname, '../pages/wallet.html'))
})

router.get('/artwork', protect, (req, res) => {
    if (debug) console.log('get/artwork')
    User.findById(req.user._id).then(user => {
        if (user.currentProjectData !== []) {
            res.send(user.currentProjectData)
        }
        else res.send(null)
    })
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
        approved: null,
        admin: false,
        username: req.body.username,
        grade: req.body.grade,
        hash: saltHash.hash,
        salt: saltHash.salt,
        owner: [],
        artist: [],
        balance: 100,
        currentProjectData: [],
        pfp: process.env.PFP_DEFAULT
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
    const newCrypto = new Crypto({
        approved: null,
        name: req.body.name,
        artist: req.user.username,
        artistId: req.user._id,
        grade: req.user.grade,
        dat: req.body.dat,
        png: req.body.png,
        trades: 0,
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
            Crypto.find({ approved: null }, (err, results) => {
                if (err) res.sendStatus(500)
                res.send(results)
            })
            break
        case 'user':
            User.find({ approved: null }, (err, results) => {
                if (err) res.sendStatus(500)
                res.send(results)
            })
            break
    }
})

router.post('/approve', protect, (req, res) => {
    //Body obj: { type: 'user' or 'crypto', user or crypto: user or crypto, approved: bool }
    switch (req.body.type) {
        case 'crypto':
            if (req.body.approved) {
                Crypto.findOneAndUpdate({ _id: req.body.crypto._id }, { approved: Date.now() })
                //add crypto to queue
            }
            else {
                Crypto.findOneAndDelete({ _id: req.body.crypto._id }, (err) => {
                    if (!err) res.sendStatus(200)
                    else res.sendStatus(500)
                })
            }
            break
        case 'user':
            if (req.body.approved) {
                User.findOneAndUpdate({ _id: req.body.user._id }, { approved: Date.now() }, (err) => {
                    if (!err) res.sendStatus(200)
                    else res.sendStatus(500)
                })
            }
            else {
                User.findOneAndDelete({ _id: req.body.user._id }, (err) => {
                    if (!err) res.sendStatus(200)
                    else res.sendStatus(500)
                })
            }
            break
    }
})

router.post('/offer', protect, (req, res) => {
    //type [create, reject, complete, delete]
    //offerObj
    //user, seller, amount, item
    if (debug) console.log('post/offer')
    switch (req.body.type) {
        case 'create':
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
            break
        case 'complete':
            req.body.offerObj.complete()
            res.sendStatus(200)
            break
        case 'reject':
            req.body.offerObj.reject()
            res.sendStatus(200)
            break
    }
})

router.post('/artwork', protect, (req, res) => {
    if (debug) console.log('post/artwork')
    User.findById(req.user._id)
        .then(user => {
            user.currentProjectData = req.body.data
            user.save()
        })
    res.sendStatus(200)
})

router.post('/query', protect, (req, res) => {
    //needs a type, filter, and items. finds a document using type and filter, then returns obj with items requested. will not return obj with params in the 'banned queries' (for security)
    if (debug) console.log('get/query')
    let bannedQueries = ['hash', 'salt']
    switch (req.body.type) {
        case 'user':
            User.findOne(req.body.filter, (err, results) => {
                if (err) { res.sendStatus(404); return; }
                let resObj = {}
                req.body.items.forEach(item => {
                    if (bannedQueries.includes(item)) return
                    resObj[item] = results[item]
                })
                res.send(resObj)
            })
            break
        case 'crypto':
            Crypto.findOne(req.body.filter, (err, results) => {
                if (err) { res.sendStatus(404); return; }
                let resObj = {}
                req.body.items.forEach(item => {
                    if (bannedQueries.includes(item)) return
                    resObj[item] = results[item]
                })
                res.send(resObj)
            })
    }
})

router.post('/batch-query', protect, (req, res) => {
    //take an array of queries and iterates the query script over it. returns array of results

    //SOLUTION: for loops with async code inside them will iterate without 'finishing' the tasks in order. Problematic when trying to populate an array with several async db queries and then returning the whole finished array afterwards. Fixed by making the resArr a promise and awaiting async queries before returning final value
    if (debug) console.log('get/query')
    let bannedQueries = ['hash', 'salt']

    new Promise(async (resolve) => {
        let resArr = []
        for (const query of req.body.batch) {
            let resObj = {}
            switch (query.type) {
                case 'user':
                    const user = User.findOne(query.filter) // find user
                    if (!user) { resArr.push(null); break; } //error handling
                    query.items.forEach(item => {
                        if (bannedQueries.includes(item)) return //secures private data
                        if (user[item] == null) console.warn(`Unsuccessful Query: post/batch-query, User ${item}`)
                        resObj[item] = user[item] //fill out obj params
                    })
                    resArr.push(resObj) //push obj to res list
                    break
                case 'crypto':
                    const crypto = await Crypto.findOne(query.filter) //pretty much the same but for other schema
                    if (!crypto) { resArr.push(null); break; }
                    query.items.forEach(item => {
                        if (bannedQueries.includes(item)) return
                        if (crypto[item] == null) console.warn(`Unsuccessful Query: post/batch-query, Crypto ${item}`)
                        resObj[item] = crypto[item]
                    })
                    resArr.push(resObj)
                    break
            }
        }
        resolve(resArr)
    }).then((resArr) => res.send(resArr))
})

//Initiallize Previous Auction
let auction
Auction.findOne({ open: true }, (err, result) => {
    if (err) throw err
    if (!result) auction = initAuction
    else auction = result
})

function initAuction(){
    let auctionEnd  = new Date()
    auctionEnd.setDate(auctionEnd.getDate() + 1)
    auctionEnd.setHours(20)
    auctionEnd.setMinutes(0)
    auctionEnd.setMilliseconds(0)

    Crypto.findOne({ approved: { $ne: null }}, (err, result) => {

    })

    const newAuction = new Auction({
        created: Date.now(),
        expires: auctionEnd,
        
    })
}



//server starts
//auction queue created
//callback set for next action loop

module.exports = router