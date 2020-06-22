const app = require('../src/app')

describe('app', () => {
    it('GET / responds with 200 containing "it works!"', () => {
        return supertest(app).get('/').expect(200, 'it works!')
    })
})