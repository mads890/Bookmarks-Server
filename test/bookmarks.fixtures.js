function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'first bookmark',
            url: 'https://www.ecosia.org/',
            description: 'first bookmark desc',
            rating: 3
        },
        {
            id: 2,
            title: 'second bookmark',
            url: 'https://www.ecosia.org/',
            description: 'second bookmark desc',
            rating: 4
        },
        {
            id: 3, 
            title: 'third bookmark',
            url: 'https://www.ecosia.org/',
            description: 'third bookmark desc',
            rating: 1
        },
        {
            id: 4,
            title: 'fourth bookmark',
            url: 'https://www.ecosia.org/',
            description: 'fourth bookmark dsct',
            rating: 2
        },
    ]
}

module.exports = { makeBookmarksArray, }