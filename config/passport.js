const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const connection = require('./database')
const validPassword = require('../lib/passwordUtils').validPassword
const User = connection.models.User

//Authentication middleware. Takes user and pass, looks up the user in the db, and then hashes the password and checks it against the db to authenticate. returns user object if passed, returns 401 if failed.
passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
        .then((user) => {
            if (!user) return done(null, false)
            if (!user.approved) return done(null, false)
            if (validPassword(password, user.hash, user.salt)) return done(null, user)
            else return done(null, false)
        })
        .catch(err => done(err))
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user)
        })
        .catch(err => done(err))
})