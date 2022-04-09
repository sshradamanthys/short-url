require('dotenv').config()

const express = require('express')
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoSanitize = require('express-mongo-sanitize')
const flash = require('connect-flash')
const User = require('./models/User')
const passport = require('passport')
const path = require('path')
const { create } = require('express-handlebars')
const csrf = require('csurf')
const { strict } = require('assert')
const mongoClient = require('./database/db')

const app = express()

// const corsOptions = {
//   credentials: true,
//   origin: process.env.HEROKU_URI || '*',
//   methods: ['GET', 'POST'],
// }

app.use(cors())

app.set('trust proxy', 1)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: process.env.SESSION_NAME,
    store: MongoStore.create({
      clientPromise: mongoClient,
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
)

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) =>
  done(null, { id: user._id, name: user.name })
)
passport.deserializeUser(async (user, done) => {
  const dbUser = await User.findById(user.id) // need this?
  return done(null, { id: dbUser._id, name: dbUser.name })
})

// view engine settings
const hbs = create({
  extname: '.hbs',
  partialsDir: ['views/partials'],
})

// settings
app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')
app.set('views', './views')

// middlewares
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

app.use(csrf())
app.use(mongoSanitize())

// locals
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  res.locals.messages = req.flash('messages')
  next()
})

app.use('/', require('./routes/home'))
app.use('/auth', require('./routes/auth'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('server 👍'))
