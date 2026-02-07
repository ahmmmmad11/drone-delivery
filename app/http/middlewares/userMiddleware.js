module.exports = async (req, res, next) => {
    if (! req.user || req.user.userableType !== 'Client') {
        return res.status(403).json({
            'message': 'forbidden, You are not allowed to access this resource'
        })
    }
    
    next()
}