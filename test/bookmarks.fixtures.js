function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'first bookmark',
            url: 'first bookmark url',
            description: 'first bookmark desc',
            rating: 3
        },
        {
            id: 2,
            title: 'second bookmark',
            url: 'second bookmark url',
            description: 'second bookmark desc',
            rating: 4
        },
        {
            id: 3, 
            title: 'third bookmark',
            url: 'third bookmark url',
            description: 'third bookmark desc',
            rating: 1
        },
        {
            id: 4,
            title: 'fourth bookmark',
            url: 'fourth bookmark url',
            description: 'fourth bookmark dsct',
            rating: 2
        },
    ]
}

module.exports = { makeBookmarksArray, }