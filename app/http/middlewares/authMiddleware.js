const {validate} = require('@/app/services/JWTService.js')

module.exports = async (req, res, next) => {
    try {
        let user = await validate(req)

        if (user?.id) {
            req.user = user
        }

        return next()
    } catch (e) {
        
    }

    return res.status(401).json({
        'message': 'unauthorized'
    })
}