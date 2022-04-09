const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
  },

  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  tokenConfirm: {
    type: String,
    default: null,
  },

  confirmedAccount: {
    type: Boolean,
    default: false,
  },

  image: {
    type: String,
    default: null,
  },
})

UserSchema.pre('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)

    user.password = hash
    next()
  } catch (error) {
    console.log(error)
    throw new Error('Error: hashing password')
    next()
  }
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = model('User', UserSchema)
