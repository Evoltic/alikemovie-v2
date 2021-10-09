const { MoviesFiller } = require('./index')
const { postgreSql } = require('../postgreSql/instance')

const moviesFiller = new MoviesFiller(
  {
    'title.basics': async function (row) {
      const [
        imdbId,
        titleType,
        primaryTitle,
        originalTitle,
        isAdult,
        startYear,
        endYear,
        runtimeMinutes,
        genres,
      ] = row

      if (titleType !== 'movie' && titleType !== 'tvSeries') return

      return this.client.query(
        `
        INSERT INTO movies (
          imdbId, 
          type, 
          title, 
          startYear, 
          endYear, 
          runtimeMinutes, 
          genres
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7) 
        ON CONFLICT (imdbId) DO NOTHING
        `,
        [
          imdbId,
          titleType,
          originalTitle,
          startYear,
          endYear,
          runtimeMinutes,
          genres ? genres.split(',') : undefined,
        ]
      )
    },
    'name.basics': async function (row) {
      const [
        imdbId,
        primaryName,
        birthYear,
        deathYear,
        primaryProfession,
        knownForTitles,
      ] = row

      return this.client.query(
        `
        INSERT INTO castAndCrew (
          imdbId,
          name,
          birthYear,
          deathYear,
          primaryProfession
        )
        VALUES($1,$2,$3,$4,$5) 
        ON CONFLICT (imdbId) DO NOTHING
        `,
        [
          imdbId,
          primaryName,
          birthYear,
          deathYear,
          primaryProfession ? primaryProfession.split(',') : undefined,
        ]
      )
    },
    'title.principals': async function (row) {
      return this.client.query(
        `
        INSERT INTO moviesCastAndCrew(
          movieId,
          castAndCrewId,
          category,
          job,
          characters,
          "order"
        )
        VALUES(
          (SELECT id FROM movies WHERE imdbId = $1),
          (SELECT id FROM castAndCrew WHERE imdbId = $2),
          $3,
          $4,
          $5,
          $6
        )
        ON CONFLICT (movieId, castAndCrewId) DO NOTHING
        `,
        [
          row[0],
          row[2],
          row[3],
          row[4],
          row[5] ? JSON.parse(row[5]) : undefined,
          row[1],
        ]
      )
    },
    'title.akas': async function (row) {
      return this.client.query(
        `
        INSERT INTO moviesTitles(
          movieId,
          "order",
          title,
          region,
          language,
          attributes,
          isOriginalTitle
        )
        VALUES(
          (SELECT id FROM movies WHERE imdbId = $1),
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        ON CONFLICT (movieId, title, isOriginalTitle) DO NOTHING
        `,
        [
          row[0],
          row[1],
          row[2],
          row[3],
          row[4],
          row[6],
          row[7] == 1 ? true : false,
        ]
      )
    },
  },
  {
    async callBeforeSaveOperations() {
      this.client = await postgreSql.getClient()
    },
    callAfterSaveOperations() {
      this.client.release()
    },
  }
)

module.exports = { moviesFiller }
