const User = require('../models/User')
const { nanoid } = require('nanoid')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
require('dotenv').config()

const registerForm = (req, res) => {
  res.render('register')
}

const loginForm = (req, res) => {
  res.render('login')
}

const registerUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash('messages', errors.array())
    return res.redirect('/auth/register')
  }

  const { name, email, password } = req.body

  try {
    let user = await User.findOne({ email })
    if (user) throw new Error('There is already a user with this email')

    user = new User({ name, email, password, tokenConfirm: nanoid() })
    user.save()

    const transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD_EMAIL,
      },
    })

    await transport.sendMail({
      from: 'sender@server.com',
      to: user.email,
      subject: 'Account Verification - shorturl',
      html: `
        <p>Account Verification</p>
        <a href=${
          process.env.HEROKU_URI || 'http://localhost:5000'
        }/auth/confirm/${user.tokenConfirm}>
          Click to verify your account
        </a>
      `,
    })

    req.flash('messages', [
      { msg: 'We have sent you an email to validate your account' },
    ])

    res.redirect('/auth/login')
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])

    return res.redirect('/auth/register')
  }
}

const accountConfirm = async (req, res) => {
  const { token } = req.params

  try {
    let user = await User.findOne({ tokenConfirm: token })
    if (!user) throw new Error('User is not confirmed')

    user.confirmedAccount = true
    user.tokenConfirm = null

    await user.save()

    req.flash('messages', [
      { msg: 'Your account has been verified, you can login' },
    ])

    res.redirect('/auth/login')
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])

    return res.redirect('/auth/login')
  }
}

const loginUser = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash('messages', errors.array())
    return res.redirect('/auth/login')
  }

  const { email, password } = req.body

  try {
    let user = await User.findOne({ email })

    // validations
    if (!user) throw new Error("This email don't found in db")
    if (!user.confirmedAccount) throw new Error('Account is not confirmed')
    if (!(await user.comparePassword(password)))
      throw new Error('Incorrect Password')

    req.login(user, function (error) {
      if (error) throw new Error('Passport Error - Creating Session')
      return res.redirect('/')
    })
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])

    return res.redirect('/auth/login')
  }
}

const logout = (req, res) => {
  req.logout()
  return res.redirect('/auth/login')
}

module.exports = {
  registerForm,
  registerUser,
  accountConfirm,
  loginForm,
  loginUser,
  logout,
}
