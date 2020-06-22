const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { bookmarks } = require('../store')
const { isWebUri } = require('valid-url')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        return res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description='', rating=1 } = req.body;
        if(!title) {
            logger.error('request must contain a title')
            return res.status(400).send('invalid data')
        }
        if(!url) {
            logger.error('request must contain a valid url')
            return res.status(400).send('invalid data')
        }
        if(Number.isNaN(rating) || !Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error('rating must be a valid integer between 1-5')
            return res.status(400).send('invalid data')
        }
        if(!isWebUri(url)) {
            logger.error(`invalid url ${url}`)
            res.status(400).send('invalid data')
        }
        const id = uuid();
        cosnt bookmark = {
            id, title, url, description, rating
        }
        bookmarks.push(bookmark)
        logger.info(`bookmark with id ${id} created`)
        return res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find(bookmark => bookmark.id === id)
        if(!bookmark) {
            logger.error(`bookmark with id ${id} not found`)
            return res.status(404).send('not found')
        }
        return res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params
        const bookIndex = bookmarks.findIndex(bookmark => bookmark.id === id)
        if (bookIndex === -1) {
            logger.error(`bookmark with id ${id} not found`)
            res.status(404).send('not found')
        }
        bookmarks.splice(bookIndex, 1)
        logger.info(`bookmark with id ${id} deleted`)
        return res.status(204).end()
    })

module.exports = bookmarksRouter