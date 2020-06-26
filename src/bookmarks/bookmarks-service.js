const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks')
    },
    getBookmarkById(knex, id) {
        return knex.select('*').from('bookmarks').where('id', id).first()
    },
    insertBookmark(knex, bookmark) {
        return knex
            .insert(bookmark)
            .into('bookmarks')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteBookmark(knex, id) {
        return knex.from('bookmarks').where({ id }).delete()
    },
    updateBookmark(knex, id, updatedInfo) {
        return knex.from('bookmarks').where({ id }).update(updatedInfo)
    }
}

module.exports = BookmarksService