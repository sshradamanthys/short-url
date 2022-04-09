const { URL } = require('url')

const validateUrl = (req, res, next) => {
  try {
    const { original } = req.body
    const urlForm = new URL(original)
    if (urlForm.original !== 'null') {
      if (urlForm.protocol === 'http:' || urlForm.protocol === 'https:') {
        return next()
      }

      throw new Error('Only http or https protocols are allowed')
    }

    throw new Error('Invalid URL')
  } catch (error) {
    req.flash('messages', [{ msg: error.message }])
    return res.redirect('/')
  }
}

module.exports = validateUrl
