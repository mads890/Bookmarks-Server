require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const bookmarksRouter = require('./bookmarks/bookmarks-router')
const validateBearerToken = require('./validate-key')
const errorHandler = require('./error-handler')

const app = express()

const morganUse = (NODE_ENV === 'production' ? 'tiny' : 'common')

app.use(morgan(morganUse))
app.use(helmet())
app.use(cors())

// app.use(validateBearerToken)

app.get('/', (req, res) => {
    res.send('it works!')
})

app.use(bookmarksRouter)

app.use(errorHandler)

module.exports = app