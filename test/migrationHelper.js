const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const testConfig = require('../test/config');

// Load modules using test configuration
const { sequelize } = testConfig.requireModule(testConfig.MODELS_PATH);

/**
 * Migration helper for tests
 */
class TestMigrationHelper {
    constructor() {
        this.umzug = new Umzug({
            migrations: {
                glob: testConfig.MIGRATIONS_PATH,
            },
            context: sequelize.getQueryInterface(),
            storage: new SequelizeStorage({ sequelize }),
            logger: console,
            // Custom resolver to ensure standard Sequelize migrations work
            resolve: ({ name, path: migrationPath, context }) => {
                // Clear require cache to avoid stale module issues
                delete require.cache[require.resolve(migrationPath)];
                const migration = require(migrationPath);

                return {
                    name,
                    up: async () => {
                        // Standard Sequelize format: up(queryInterface, Sequelize)
                        return migration.up(context, sequelize.Sequelize);
                    },
                    down: async () => {
                        if (!migration.down) {
                            throw new Error(`Migration ${name} does not have a down method`);
                        }

                        // Standard Sequelize format: down(queryInterface, Sequelize)
                        return migration.down(context, sequelize.Sequelize);
                    }
                };
            }
        });
    }

    /**
     * Run all migrations
     */
    async runMigrations() {
        try {
            console.log('Running migrations...');
            await this.umzug.up();
            console.log('Migrations completed successfully');
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }

    /**
     * Rollback all migrations
     */
    async rollbackMigrations() {
        try {
            console.log('Rolling back migrations...');
            await this.umzug.down({ to: 0 });
            console.log('Migrations rolled back successfully');
        } catch (error) {
            console.error('Migration rollback failed:', error);
            throw error;
        }
    }

    /**
     * Rollback a specific number of migrations
     */
    async rollbackSteps(steps = 1) {
        try {
            console.log(`Rolling back ${steps} migration(s)...`);
            for (let i = 0; i < steps; i++) {
                await this.umzug.down();
            }
            console.log(`Rolled back ${steps} migration(s) successfully`);
        } catch (error) {
            console.error('Migration rollback failed:', error);
            throw error;
        }
    }

    /**
     * Reset database (rollback then migrate)
     */
    async resetDatabase() {
        await this.rollbackMigrations();
        await this.runMigrations();
    }

    /**
     * Get pending migrations
     */
    async getPendingMigrations() {
        return await this.umzug.pending();
    }

    /**
     * Get executed migrations
     */
    async getExecutedMigrations() {
        return await this.umzug.executed();
    }
}

module.exports = TestMigrationHelper;