const validateLocation = require('@/app/validations/validateLocation')

module.exports = (req, res, next) => {
    const {
        location
    } = req.body;

    const errors = [];

    const originLocationErrors = validateLocation(location, 'location');
    if (originLocationErrors) {
        errors.push(...originLocationErrors);
    }

    if (errors.length > 0) {
        return res.status(422).json({ errors });
    }

    next();
}