const mongoose = require('mongoose')
require('dotenv').config()

const mongoClient = mongoose
  .connect(process.env.MONGODB_URI)
  .then((m) => {
    console.log('database 👍')
    return m.connection.getClient()
  })
  .catch((error) => console.log(error))

module.exports = mongoClient
