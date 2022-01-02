let protect = function (req, res, next) {
    if (!req.isAuthenticated()) res.redirect('/login')
    next()
}

module.exports.protect = protect