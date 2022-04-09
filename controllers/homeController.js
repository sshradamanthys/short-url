const Url = require('../models/Url')
const User = require('../models/User')
const { nanoid } = require('nanoid')

const getUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user.id }).lean()
    res.render('home', { urls })
  } catch (error) {
    req.flash('messages', { msg: error.message })
    return res.redirect('/')
  }
}

const addUrl = async (req, res) => {
  const { original } = req.body
  try {
    const url = Url({ original, short: nanoid(6), user: req.user.id })
    await url.save()

    req.flash('messages', [{ msg: 'URL added successfully' }])
    return res.redirect('/')
  } catch (error) {
    req.flash('messages', { msg: error.message })
    return res.redirect('/')
  }
}

const deleteUrl = async (req, res) => {
  const { id } = req.params

  try {
    const url = await Url.findById(id)
    if (!url.user.equals(req.user.id))
      throw new Error("This URL doesn't belong to your account")

    await url.remove()
    req.flash('messages', [{ msg: 'URL deleted successfully' }])

    return res.redirect('/')
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])
    return res.redirect('/')
  }
}

const editUrl = async (req, res) => {
  const { id } = req.params

  try {
    const url = await Url.findById(id).lean()

    if (!url.user.equals(req.user.id))
      throw new Error("This URL doesn't belong to your account")

    return res.render('home', { url })
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])
    return res.redirect('/')
  }
}

const editUrlForm = async (req, res) => {
  const { id } = req.params
  const { original } = req.body
  try {
    const url = await Url.findById(id)
    if (!url.user.equals(req.user.id))
      throw new Error("This URL doesn't belong to your account")

    await url.updateOne({ original })
    req.flash('messages', [{ msg: 'URL edited successfully' }])

    return res.redirect('/')
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])
    return res.redirect('/')
  }
}

const redirectToUrl = async (req, res) => {
  const { short } = req.params

  try {
    const url = await Url.findOne({ short })
    return res.redirect(url.original)
  } catch (error) {
    req.flash('messages', [{ msg: "URL doesn't exist on the db" }])
    return res.redirect('/auth/login')
  }
}

module.exports = {
  getUrls,
  addUrl,
  deleteUrl,
  editUrl,
  editUrlForm,
  redirectToUrl,
}
