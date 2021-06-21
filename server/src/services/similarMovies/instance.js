const { postgreSql } = require('../postgreSql/instance')

// todo:
//  distinct actors and authors by weight;
//  limit the result;
//  remove the first row from the result;
//  cache the result;

const similarMovies = new class {
  findById(id) {
    return postgreSql
      .query(
        `   
        WITH movieCastAndCrew AS (
          SELECT * FROM moviescastandcrew
          WHERE moviescastandcrew.movieid = $1
        ), sameCastAndCrewMovies AS (
          SELECT
            moviesCastAndCrew.movieId,
            1 / (ABS(movieCastAndCrew.order - moviesCastAndCrew.order) + movieCastAndCrew.order + moviesCastAndCrew.order)^2
                as score
          FROM movieCastAndCrew
          LEFT JOIN moviesCastAndCrew
            ON movieCastAndCrew.castandcrewid = moviesCastAndCrew.castandcrewid
            AND movieCastAndCrew.category = moviesCastAndCrew.category
        ), sameCastAndCrewMoviesUnique AS (
            SELECT movieId, SUM (score) score FROM sameCastAndCrewMovies
            GROUP BY movieid
            ORDER BY score DESC
        )
        
        SELECT * FROM sameCastAndCrewMoviesUnique
        LEFT JOIN movies ON movies.id = sameCastAndCrewMoviesUnique.movieid;
    `,
        [id]
      )
      .then(result => result.rows)
  }
}

module.exports = { similarMovies }
