const validateString = require('@/app/validations/validateString')
const validateLocation = require('@/app/validations/validateLocation')
const validateAddress = require('@/app/validations/validateAddress')

module.exports = (req, res, next) => {
    const {
        description,
        originAddress,
        distinationAddress,
        originLocation,
        destinationLocation
    } = req.body;

    const errors = [];

    const descriptionErrors = validateString(description, 'description');
    if (descriptionErrors) {
        errors.push(...descriptionErrors);
    }

    const originAddressErrors = validateAddress(originAddress, 'originAddress');
    if (originAddressErrors) {
        errors.push(...originAddressErrors);
    }

    const destinationAddress = validateAddress(distinationAddress, 'destinationAddress');
    if (destinationAddress) {
        errors.push(...destinationAddress);
    }

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