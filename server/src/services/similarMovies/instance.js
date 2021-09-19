const { postgreSql } = require('../postgreSql/instance')

// todo:
//  limit the result;
//  remove the first row from the result;
//  cache the result;
//  improve query speed;

const similarMovies = new (class {
  findById(id, types = ['movie', 'tvSeries']) {
    return postgreSql
      .query(
        `      
        WITH movieCastAndCrew AS (
          SELECT * FROM moviescastandcrew
          WHERE moviescastandcrew.movieid = $1
        ), sameCastAndCrew AS (
          SELECT
            moviesCastAndCrew.movieId,      
            (CASE 
              WHEN movieCastAndCrew.category IN ('actor', 'actress') 
                THEN (ABS(movieCastAndCrew.order - moviesCastAndCrew.order) + movieCastAndCrew.order + moviesCastAndCrew.order)^(-1)
              WHEN movieCastAndCrew.category IN ('director', 'writer') 
                THEN (2 + ABS(movieCastAndCrew.order - moviesCastAndCrew.order))^(-1)
              ELSE 
                0
            END) as scoreForCrew
          FROM movieCastAndCrew
          LEFT JOIN moviesCastAndCrew
            ON movieCastAndCrew.castandcrewid = moviesCastAndCrew.castandcrewid
            AND movieCastAndCrew.category = moviesCastAndCrew.category
        ), sameByCastAndCrewMoviesBrief AS (
            SELECT movieId, SUM (scoreForCrew) as scoreForCrew 
            FROM sameCastAndCrew
            GROUP BY movieid
        ), sameByCastAndCrewMoviesExtended AS (
          SELECT * FROM sameByCastAndCrewMoviesBrief
          LEFT JOIN movies ON movies.id = sameByCastAndCrewMoviesBrief.movieid
        ), sameByCastAndCrewMovies AS (
          SELECT
            *,
            (
              SELECT COUNT(*)
              FROM 
                unnest(
                    (SELECT genres FROM movies WHERE movies.id = $1),
                    sameByCastAndCrewMoviesExtended.genres
                ) AS t(a, b)
              WHERE a=b
            )*0.5 AS scoreForGenres
          FROM sameByCastAndCrewMoviesExtended
          WHERE type = ANY ($2)
        )

        SELECT 
          *, 
          (sameByCastAndCrewMovies.scoreForCrew + scoreForGenres) AS score
        FROM sameByCastAndCrewMovies
        ORDER BY score DESC;
    `,
        [id, types]
      )
      .then((result) => result.rows)
  }
})()

module.exports = { similarMovies }
