const { v4: uuid } = require('uuid')

const bookmarks = [
    {
        id: uuid(),
        title: 'Google',
        url: 'www.google.com',
        description: 'search for anything, anytime, anywhere',
        rating: 5
    },
    {
        id: uuid(),
        title: 'Facebook',
        url: 'www.facebook.com',
        description: 'meet people. buy stuff. join online chat groups.',
        rating: 3
    }
]

module.exports = { bookmarks }