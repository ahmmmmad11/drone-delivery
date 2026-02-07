const validateString = require('@/app/validations/validateString')

module.exports = (address, field = 'address') => {
    const errors = [];

    if (! address) {
        return null
    }

    if (typeof address !== 'object') {
         let error = {}
         error[field] = `${field} must be an object`;
         errors.push(error);
    } else {
        validateString(address.street, `${field}.street`)?.forEach(error => errors.push(error));
        validateString(address.city, `${field}.city`)?.forEach(error => errors.push(error));
        validateString(address.state, `${field}.state`)?.forEach(error => errors.push(error));
        validateString(address.country, `${field}.country`)?.forEach(error => errors.push(error));
    }

    if (errors.length > 0) {
        return errors;
    }

    return null;
}