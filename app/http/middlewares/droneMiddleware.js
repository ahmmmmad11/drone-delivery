module.exports = async (req, res, next) => {
    if (! req.user || req.user.userableType !== 'Drone') {
        return res.status(403).json({
            'message': 'forbidden, You are not allowed to access this resource'
        })
    }

    next()
}