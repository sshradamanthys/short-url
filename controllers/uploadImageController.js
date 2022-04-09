const formidable = require('formidable')
const Jimp = require('jimp')
const path = require('path')
const fs = require('fs')

const User = require('../models/User')

const MAX_SIZE = 2 * 1024 * 1024
const imagesTypes = ['image/jpeg', 'image/png', 'image/gif']

const profilePage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    return res.render('profile', { user: req.user, image: user.image })
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])
    return res.redirect('/profile')
  }

  res.render('profile')
}

const uploadImage = async (req, res) => {
  const form = new formidable.IncomingForm()
  form.maxFileSize = MAX_SIZE
  form.parse(req, async (err, field, files) => {
    try {
      // validations
      if (err) {
        req.flash('messages', [{ msg: 'Error uploading file - Formidable' }])
      }

      const { file } = files

      if (file.originalFilename === '')
        throw new Error('Please add a valid image')

      if (!imagesTypes.includes(file.mimetype))
        throw new Error('Allowed formats: jpg, jpeg, png, gif')

      if (file.size > MAX_SIZE)
        throw new Error('Images up to 2Mb is the maximun allowed')

      const ext = file.mimetype.split('/')[1]
      const dirFile = path.join(
        __dirname,
        `../public/images/profiles/${req.user.id}.${ext}`
      )

      fs.renameSync(file.filepath, dirFile)

      const image = await Jimp.read(dirFile)
      image.resize(200, 200).quality(90).writeAsync(dirFile)

      const user = await User.findById(req.user.id)

      user.image = `${req.user.id}.${ext}`

      await user.save()

      req.flash('messages', [{ msg: 'image uploaded' }])
    } catch (error) {
      req.flash('messages', [{ msg: error.message }])
    } finally {
      return res.redirect('/profile')
    }
  })
}

module.exports = {
  profilePage,
  uploadImage,
}
