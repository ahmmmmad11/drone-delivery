module.exports = (location, field) => {
    const errors = [];

    if (! location) {
        return null
    }

    if (typeof location !== 'object') {
        let error = {};
        error[field] = `${field} must be an object`;
        errors.push(error);
    } else {
        if (typeof location.lat !== 'number') {
            errors.push(JSON.parse(`{"${field}.lat": "${field} lat must be a number"}`));
        }

        if (typeof location.lng !== 'number') {
            errors.push(JSON.parse(`{"${field}.lng": "${field} lng must be a number"}`));
        }
    }

    if (errors.length > 0) {
        return errors;
    }

    return null;
}