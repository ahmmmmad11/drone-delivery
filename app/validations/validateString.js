module.exports = (statement, field) => {
    const errors = [];

    if (typeof statement !== 'string' || statement.trim() === '') {
        let error = {};
        error[field] = `${field} must be a non-empty string`;

        errors.push(error);
    }

    if (errors.length > 0) {
        return errors;
    }

    return null;
}