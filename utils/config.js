require('dotenv').config()

const PORT = process.env.PORT
const environment = process.env.NODE_ENV
const MONGODB_URI = environment === 'test' ? process.env.TEST_MONGODB_URI  :process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT,
  environment,
}
