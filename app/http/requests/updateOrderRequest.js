const validateLocation = require('@/app/validations/validateLocation')

module.exports = (req, res, next) => {
    const {
        originLocation,
        destinationLocation
    } = req.body;

    const errors = [];

    const originLocationErrors = validateLocation(originLocation, 'originLocation');
    if (originLocationErrors) {
        errors.push(...originLocationErrors);
    }

    const destinationLocationErrors = validateLocation(destinationLocation, 'destinationLocation');
    if (destinationLocationErrors) {
        errors.push(...destinationLocationErrors);
    }

    if (errors.length > 0) {
        return res.status(422).json({ errors });
    }

    next();
}