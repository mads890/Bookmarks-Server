const app = require('./app')
const { PORT, DB_URL } = require('./config')
const knex = require('knex')

const db = knex({
    client: 'pg',
    connection: DB_URL,
})

app.set('db', db)

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`listening on ${PORT}`)
})