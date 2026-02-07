const {validate} = require('@/app/services/JWTService.js')

module.exports = async (req, res, next) => {
    try {
        let user = await validate(req)

        if (user?.id) {
            return res.status(403).json({
                'message': 'forbidden, You already logged in'
            })
        }
    } catch (e) {

    }

    next()
}