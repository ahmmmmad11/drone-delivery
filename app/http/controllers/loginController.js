
const {User} = require('@/app/models/index.js')
const {generateToken} = require('@/app/services/JWTService.js')

const getUser = async (name, type) => {
    if (type === 'enduser') {
        type = 'client'
    }

    let user = await User.findOne({
        where: {name: name, userableType: type}
    })

    if (! user) {
        throw "provided credentials dosn't match our records"
    }

    return user
}

module.exports = {
    login: async (req, res) => {
        let name = req.body.name
        let type = req.body.type

        if (!name) {
            return res.status(422).json({
                message: 'name is required'
            })
        }

        if (!type) {
            return res.status(422).json({
                message: 'type is required'
            })
        }

        if (! ['admin', 'drone', 'enduser'].includes(type)) {
            return res.status(422).json({
                message: 'unsupported type'
            })
        }

        let user = null;

        try{
            user = await getUser(name, type)
        }catch(e) {
            res.status(400).json({
                message: e
            })
        }
        
        res.status(200).json({
            message: 'logged in successfully',
            user: user,
            token: await generateToken(user)
        })
    }
}