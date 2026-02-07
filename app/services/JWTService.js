const jwt = require('jsonwebtoken');

const getToken = async (req) => {
    if (! req.headers?.authorization) {
        return null
    }

    if (req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    }

    return null;
}

module.exports = {
    generateToken: async (user) => {
        return await jwt.sign({
            id: user.id,
            userableType: user.userableType,
            userableId: user.userableId,
            name: user.name
        }, process.env.APP_KEY);
    },
    validate: async (req) => {
        let token = await getToken(req)
        
        return jwt.verify(token, process.env.APP_KEY, (err, decoded) => {
            if (err) {
                throw err
            }

            return decoded
        })
    }
}