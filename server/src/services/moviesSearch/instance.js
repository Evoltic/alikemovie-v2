const { postgreSql } = require('../postgreSql/instance')

// TODO: make a search more accurate

const moviesSearch = new class {
  build() {
    return postgreSql.query(
      `
      INSERT INTO moviesDocuments (movieid, document)
      SELECT id, to_tsvector(title) FROM movies
      ON CONFLICT (movieid) DO UPDATE SET document = EXCLUDED.document;
      `
    )
  }

  search(query, type) {
    return postgreSql.query(
      `
      SELECT * FROM movies
      LEFT JOIN moviesDocuments ON movies.id = moviesDocuments.movieId
      WHERE document @@ plainto_tsquery($1) AND movies.type = $2
      `,
      [query, type]
    ).then(result => result.rows)
  }
}

module.exports = {moviesSearch}