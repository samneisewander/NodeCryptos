const crypto = require('crypto')

function genPassword(password) {
    let salt = crypto.randomBytes(32).toString('hex')
    let hash = crypto.pbkdf2(password, salt, 10000, 64, 'sha512').toString('hex')
    return{
        salt: salt,
        hash: hash
    }
}

function validPassword(password, hash, salt){
    let comparator = crypto.pbkdf2(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === comparator
}

module.exports.validPassword = validPassword
module.exports.genPassword = genPassword