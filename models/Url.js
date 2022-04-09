const { Schema, model } = require('mongoose')

const UrlSchema = new Schema({
  original: {
    type: String,
    unique: true,
    required: true,
  },
  short: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

module.exports = model('Url', UrlSchema)
