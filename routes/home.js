const { Router } = require('express')
const router = Router()

const {
  getUrls,
  addUrl,
  deleteUrl,
  editUrl,
  editUrlForm,
  redirectToUrl,
} = require('../controllers/homeController')

const {
  profilePage,
  uploadImage,
} = require('../controllers/uploadImageController')

const validateUrl = require('../middlewares/validateUrl')
const validateUser = require('../middlewares/validateUser')

router.get('/', validateUser, getUrls)
router.post('/', validateUser, validateUrl, addUrl)
router.get('/delete/:id', validateUser, deleteUrl)
router.get('/edit/:id', validateUser, editUrl)
router.post('/edit/:id', validateUser, validateUrl, editUrlForm)
router.get('/redirect/:short', redirectToUrl)

router.get('/profile', validateUser, profilePage)
router.post('/profile', validateUser, uploadImage)

module.exports = router
