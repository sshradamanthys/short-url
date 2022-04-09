const { Router } = require('express')
const { body } = require('express-validator')
const {
  registerForm,
  registerUser,
  accountConfirm,
  loginForm,
  loginUser,
  logout,
} = require('../controllers/authController')

const router = Router()

router.get('/register', registerForm)
router.post(
  '/register',
  [
    body('name', 'Insert a valid name').trim().notEmpty().escape(),
    body('email', 'Insert a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters')
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.confirm)
          throw new Error('Password & Confirm must match')

        return value
      }),
  ],
  registerUser
)

router.get('/confirm/:token', accountConfirm)
router.get('/login', loginForm)

router.post(
  '/login',
  [
    body('email', 'Insert a valid email').trim().isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters')
      .trim()
      .isLength({ min: 6 })
      .escape(),
  ],
  loginUser
)

router.get('/logout', logout)

module.exports = router
