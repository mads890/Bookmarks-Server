const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { bookmarks } = require('../store')
const { isWebUri } = require('valid-url')
const BookmarksService = require('./bookmarks-service')
const xss = require('xss')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/api/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
        .then(bookmarks => {
            const safeBookmarks = bookmarks.map(bookmark => {
                let newBookmark = {
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: bookmark.url,
                    description: xss(bookmark.description),
                    rating: bookmark.rating
                }
                return newBookmark
            })
            return res.json(safeBookmarks)
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['title', 'url', 'rating']) {
            if(!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).json({ error: { message: `missing '${field}' in req.body`}})
            }
        }
        const { title, url, description='', rating=1 } = req.body;
        const ratingNum = Number(rating)
        if(Number.isNaN(ratingNum) || !Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error('rating must be a valid integer between 1-5')
            return res.status(400).send('invalid data')
        }
        if(!isWebUri(url)) {
            logger.error(`invalid url ${url}`)
            res.status(400).send('invalid data')
        }
        const bookmark = {
            title: xss(title), 
            url, 
            description: xss(description), 
            rating
        }
        BookmarksService.insertBookmark(req.app.get('db'), bookmark)
            .then(bookmark => {
                logger.info(`bookmark with id ${bookmark.id} created`)
                return res.status(201).location(`/api/bookmarks/${bookmark.id}`).json(bookmark)
            })
            .catch(next)
    })

bookmarksRouter
    .route('/api/bookmarks/:id')
    .all((req, res, next) => {
        const { id } = req.params
        BookmarksService.getBookmarkById(req.app.get('db'), id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`bookmark with id ${id} not found`)
                    return res.status(404).json({ error: { message: 'not found' } })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const { id } = req.params
        BookmarksService.getBookmarkById(req.app.get('db'), id)
        .then(bookmark => {
            const safeBookmark = {
                id: bookmark.id,
                title: xss(bookmark.title),
                url: bookmark.url,
                description: xss(bookmark.description),
                rating: bookmark.rating
            }
            return res.json(safeBookmark)
        })
        .catch(next)
    })
    .delete((req, res, next) => {
        const { id } = req.params
        BookmarksService.deleteBookmark(req.app.get('db'), id)
            .then(data => {
                logger.info(`bookmark with id ${id} deleted`)
                res.status(204).end()
            })
            .catch(next)    
    })
    .patch((req, res, next) => {
        const { title, url, description, rating } = req.body
        const ratingNum = Number(rating)
        if(Number.isNaN(ratingNum) || !Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error('rating must be a valid integer between 1-5')
            return res.status(400).send('invalid data')
        }
        if(!isWebUri(url)) {
            logger.error(`invalid url ${url}`)
            res.status(400).send('invalid data')
        }
        const updatedBookmark = { title: xss(title), url, description: xss(description), ratingNum, }
        BookmarksService.updateBookmark(req.app.get('db'), req.params.id, updatedBookmark)
            .then(data => {
                logger.info(`bookmark with id ${id} updated`)
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter