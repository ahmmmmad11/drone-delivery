const path = require('path');

/**
 * Test Configuration
 *
 * Adjust these paths to match your project structure
 */

module.exports = {
    // Root directory of your project (where package.json is located)
    PROJECT_ROOT: path.resolve(__dirname, '..'),

    // Path to models directory
    MODELS_PATH: 'app/models/index.js',

    // Path to services directory
    SERVICES_PATH: 'app/services',

    // Path to enums directory
    ENUMS_PATH: 'app/enums',

    // Path to migrations directory
    MIGRATIONS_PATH: 'database/migrations/*.js',

    /**
     * Get absolute path for a module
     * @param {string} relativePath - Relative path from project root
     * @returns {string} Absolute path
     */
    getPath(relativePath) {
        return path.join(this.PROJECT_ROOT, relativePath);
    },

    /**
     * Require a module using the configured paths
     * @param {string} modulePath - Path relative to project root
     * @returns {any} Required module
     */
    requireModule(modulePath) {
        return require(this.getPath(modulePath));
    }
};