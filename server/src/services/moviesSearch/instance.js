const { postgreSql } = require('../postgreSql/instance')

// TODO: make a search more accurate

const moviesSearch = new (class {
  build() {
    return postgreSql.query(
      `
      INSERT INTO moviesDocuments (movieid, document)
      SELECT
        movieid,
        setweight(to_tsvector(string_agg(title, '; ')), 'A')
      FROM moviestitles
      WHERE
        region = 'US' OR
        region = 'RU' OR
        language = 'en' OR
        language = 'ru' OR
        isoriginaltitle = true
      GROUP BY moviestitles.movieid
      ON CONFLICT (movieid) DO UPDATE SET document = EXCLUDED.document;

      INSERT INTO moviesDocuments (movieid, document)
      SELECT
        id,
        setweight(to_tsvector(cast(startYear as varchar)), 'B')  ||
        setweight(to_tsvector(coalesce(cast(endYear as varchar),'')), 'C')  ||
        setweight(to_tsvector(coalesce(array_to_string(genres, ' '), '')), 'D')
      FROM movies
      ON CONFLICT (movieid) DO UPDATE SET document = moviesDocuments.document || EXCLUDED.document;
      `
    )
  }

  search(query, types = ['movie', 'tvSeries']) {
    return postgreSql
      .query(
        `
        SELECT * FROM movies
        LEFT JOIN moviesDocuments ON movies.id = moviesDocuments.movieId
        WHERE document @@ plainto_tsquery($1) 
        AND movies.type = ANY ($2)
        AND runtimeMinutes IS NOT NULL
      `,
        [query, types]
      )
      .then((result) => result.rows)
  }
})()

module.exports = { moviesSearch }
