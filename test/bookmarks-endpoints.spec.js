const { makeBookmarksArray } = require('./bookmarks.fixtures')
const app = require('../src/app')
const knex = require('knex')
const { expect } = require('chai')
const supertest = require('supertest')

describe('bookmarks endpoints', function() {
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

    describe('GET /api/bookmarks', () => {
        context('given no bookmarks', () => {
            it('responds with 200 and []', () => {
                return supertest(app).get('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(200, [])
            })
        })

        context('given bookmarks in db', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach(() => {
                return db.insert(testBookmarks).into('bookmarks')
            })

            it('returns all bookmarks', () => {
                return supertest(app).get('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(200, testBookmarks)
            })
        })

        context('given a xss bookmark', () => {
            const xssBookmark = {
                id: 911,
                title: 'malicious bookmark <script>alert("xss");</script>',
                url: 'www.hacked.com',
                description: 'nonexistent image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
                rating: 1
            }
            beforeEach(() => {
                return db.insert(xssBookmark).into('bookmarks')
            })
            return supertest(app).get(`/api/bookmarks`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql('malicious bookmark &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    expect(res.body.description).to.eql('nonexistent image <img src="https://url.to.file.which/does-not.exist">')
                })
        })
    })

    describe('GET /api/bookmarks/:id', () => {
        context('given no bookmarks', () => {
            it('responds with 404 and appropriate error message', () => {
                const testId = 12345
                const expected = { error: {message: 'not found'} }
                return supertest(app).get(`/api/bookmarks/${testId}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(404, expected)
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
                return supertest(app).get(`/api/bookmarks/${testId}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(200, expectedBookmark)
            })
        })

        context('given a xss bookmark', () => {
            const xssBookmark = {
                id: 911,
                title: 'malicious bookmark <script>alert("xss");</script>',
                url: 'www.hacked.com',
                description: 'nonexistent image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
                rating: 1
            }
            beforeEach(() => {
                return db.insert(xssBookmark).into('bookmarks')
            })
            return supertest(app).get(`/api/bookmarks/${xssBookmark.id}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql('malicious bookmark &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                    expect(res.body.description).to.eql('nonexistent image <img src="https://url.to.file.which/does-not.exist">')
                })
        })
    })

    describe('POST /api/bookmarks', () => {
        it('creates a bookmark, responds with 201 and the new bookmark', () => {
            const testBookmark = {
                title: 'test title',
                url: 'https://www.ecosia.org/',
                description: 'test content',
                rating: 2
            }
            return supertest(app).post('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testBookmark).expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(testBookmark.title)
                    expect(res.body.url).to.eql(testBookmark.url)
                    expect(res.body.description).to.eql(testBookmark.description)
                    expect(res.body.rating).to.eql(testBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                })
                .then(postRes => {
                    supertest(app).get(`/api/bookmarks/${postRes.body.id}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(postRes.body)
                })
        })

        context('missing or invalid data', () => {
            const requiredFields = ['title', 'url', 'rating']
            requiredFields.forEach(field => {
                const testBookmark = {
                    title: 'test title',
                    url: 'https://www.ecosia.org/',
                    content: 'test content',
                    rating: 2
                }
                it(`responds with 400 and err message when ${field} is missing`, () => {
                    delete testBookmark[field]
                    return supertest(app).post('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testBookmark).expect(400, { error: { message: `missing '${field}' in req.body` } })
                })
            })

            it('responds with 400 and err message when given an invalid url', () => {
                const testBookmark = {
                    title: 'test title',
                    url: 'some-invalid-url',
                    content: 'test content',
                    rating: 2
                }
                return supertest(app).post('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testBookmark).expect(400, { error: { message: 'invalid data' } })
            })

            it('responds with 400 and err message when given a rating that is not between 1-5', () => {
                const testBookmark = {
                    title: 'test title',
                    url: 'https://www.ecosia.org/',
                    content: 'test content',
                    rating: 7
                }
                return supertest(app).post('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testBookmark).expect(400, {error: {message: 'invalid data'}})
            })
        })
        

        

        context('attempted POST of a xss article', () => {
            const xssBookmark = {
                id: 911,
                title: 'malicious bookmark <script>alert("xss");</script>',
                url: 'https://www.ecosia.org/',
                description: 'nonexistent image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
                rating: 1
            }
            it('sanitizes title and description before POSTing', () => {
                return supertest(app).post('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(xssBookmark).expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql('malicious bookmark &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.description).to.eql('nonexistent image <img src="https://url.to.file.which/does-not.exist">')
                    })
            })
        })
    })

    describe('DELETE /api/bookmarks/:id', () => {
        context('given bookmarks', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach(() => {
                return db.into('bookmarks').insert(testBookmarks)
            })
            it('responds with 204 and deletes the bookmark', () => {
                const idToRemove = 2
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
                supertest(app).delete(`/api/bookmarks/${idToRemove}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(204)
                    .then(res => {
                        supertest(app).get('/api/bookmarks').set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(expectedBookmarks)
                    })
            })
        })

        context('given no bookmarks', () => {
            it('responds with 404', () => {
                const id = 12345
                return supertest(app).set('Authorization', `Bearer ${process.env.API_TOKEN}`).delete(`/api/bookmarks/${id}`)
                .expect(404, { error: {message: 'not found'} })
            })
        })
    })

    describe.only('PATCH /api/bookmarks/:id', () => {
        context('given no bookmarks', () => {
            it('responds with 404 and err message', () => {
                const idToUpdate = 12345
                return supertest(app).patch(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(404, {error: {message: 'not found'}})
            })
        })
        context('given bookmarks', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach(() => {
                return db.into('bookmarks').insert(testBookmarks)
            })

            it('responds with 404 and err message if no id is given', () => {
                const testUpdate = {
                    title: 'updated title',
                    url: 'https://www.ecosia.org/',
                    description: 'updated description',
                    rating: 3
                }
                return supertest(app).patch(`/api/bookmarks/`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testUpdate).expect(404, {error: {message: 'invalid data'}})
            })

            it('responds with 204 and updates article', () => {
                const idToUpdate = 2
                const testUpdate = {
                    title: 'updated title',
                    url: 'https://www.ecosia.org/',
                    description: 'updated description',
                    rating: 3
                }
                const expected = {
                    ...testBookmarks[idToUpdate - 1],
                    ...testUpdate,
                }
                return supertest(app).patch(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testUpdate).expect(204)
                    .then(res => {
                        return supertest(app).get(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(expected)
                    })
            })

            it('responds 400 when not provided updatable keys', () => {
                const idToUpdate = 2
                const testUpdate = {
                    invalidKey: 'should not update',
                }
                return supertest(app).patch(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testUpdate).expect(400, {error: {message: 'invalid data'}})
            })

            it('responds 204 when updating only a subset of fields', () => {
                const idToUpdate = 2
                const testUpdate = {
                    title: 'updated title',
                    description: 'updated description',
                }
                const expected = {
                    ...testBookmarks[idToUpdate - 1],
                    ...testUpdate,
                }
                return supertest(app).patch(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).send({...testUpdate, invalidKey: 'should not update'}).expect(204)
                    .then(res =>
                        supertest(app).get(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).expect(expected)
                    )
            })

            it('responds 400 and err message if rating is not between 1-5', () => {
                const idToUpdate = 2
                const testUpdate = {
                    ...testBookmarks[idToUpdate - 1],
                    rating: 7,
                }
                return supertest(app).patch(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testUpdate).expect(400, {error: {message: 'invalid data'}})
            })

            it('responds 400 and err message when given an invalid url', () => {
                const idToUpdate = 2
                const testUpdate = {
                    ...testBookmarks[idToUpdate - 1],
                    url: 'some-invalid-url',
                }
                return supertest(app).patch(`/api/bookmarks/${idToUpdate}`).set('Authorization', `Bearer ${process.env.API_TOKEN}`).send(testUpdate).expect(400, {error: {message: 'invalid data'}})
            })
        })
    })
})