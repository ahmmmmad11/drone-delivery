require('dotenv').config()

module.exports = {
  development: {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": process.env.DB_TYPE || 'mysql'
  },
  test: {
    "username": process.env.DB_TEST_USERNAME,
    "password": process.env.DB_TEST_PASSWORD,
    "database": process.env.DB_TEST_DATABASE,
    "host": process.env.DB_TEST_HOST,
    "port": process.env.DB_TEST_PORT,
    "dialect": process.env.DB_TEST_TYPE || 'mysql'
  },
  production: {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": process.env.DB_TYPE || 'mysql'
  }
}
