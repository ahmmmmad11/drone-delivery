require('module-alias/register');

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
const DEFAULT_TIMEOUT = 10000;

// Setup chai
const chai = require('chai');
chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

// Optional: Add chai plugins
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);

// Global before hook for all tests
before(function() {
    this.timeout(30000); // Set longer timeout for setup
    console.log('Starting test suite...');
});

// Global after hook for all tests
after(function() {
    console.log('Test suite completed');
});

// Set default timeout for all tests
exports.mochaHooks = {
    beforeEach() {
        this.timeout(DEFAULT_TIMEOUT);
    }
};