const { makeBookmarksArray } = require('./bookmarks.fixtures')
const app = require('../src/app')
const knex = require('knex')
const { expect } = require('chai')

describe.only('bookmarks endpoints', function() {
    let db

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    after(() => db.destroy())
    before(() => db('bookmarks').truncate())
    afterEach(() => db('bookmarks').truncate())

    describe('GET /bookmarks', () => {
        context('given no bookmarks', () => {
            it('responds with 200 and []', () => {
                return supertest(app).get('/articles').expect(200, [])
            })
        })

        context('given bookmarks in db', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach(() => {
                return db.insert(testBookmarks).into('bookmarks')
            })

            it('returns all bookmarks', () => {
                return supertest(app).get('/bookmarks').expect(200, testBookmarks)
            })
        })
    })

    describe('GET /bookmarks/:id', () => {
        context('given no bookmarks', () => {
            it('responds with 404 and appropriate error message', () => {
                const testId = 12345
                const expected = { error: {message: 'not found'} }
                return supertest(app).get(`/bookmarks/${testId}`).expect(404, expected)
            })
        })
        
        context('given bookmarks', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach(() => {
                return db.insert(testBookmarks).into('bookmarks')
            })

            it('returns the specified bookmark', () => {
                const testId = 2
                const expectedBookmark = testBookmarks[testId - 1]
                return supertest(app).get(`/bookmarks/${testId}`).expect(200, expectedBookmark)
            })
        })
    })
})