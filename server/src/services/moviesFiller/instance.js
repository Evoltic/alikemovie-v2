const { MoviesFiller } = require('./index')
const { postgreSql } = require('../postgreSql/instance')
const { logger } = require('../../functions/logger')

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
      if (!startYear) return
      if (!runtimeMinutes) return

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

      if (!primaryName) return
      if (!birthYear) return

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
      const [movieImdbId, order, castAndCrewImdbId, category, job, characters] =
        row

      const movieId = this.idMap.movies[movieImdbId]
      const castAndCrewId = this.idMap.cast[castAndCrewImdbId]

      if (!movieId) return
      if (!castAndCrewId) return

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
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6
            )
            ON CONFLICT (movieId, castAndCrewId) DO NOTHING
          `,
        [
          movieId,
          castAndCrewId,
          category,
          job,
          characters ? JSON.parse(characters) : undefined,
          order,
        ]
      )
    },
    'title.akas': async function (row) {
      const [imdbId, ordering, title, region, language, types, attributes] = row

      const movieId = this.idMap.movies[imdbId]
      if (!movieId) return

      const isOriginalTitle = row[7] === '1'
      const isRegionOk = region === 'US' || region === 'RU'
      const isLanguageOk = language === 'en' || language === 'ru'

      if (isOriginalTitle || isRegionOk || isLanguageOk) {
        // then ok
      } else {
        return
      }

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
          $1,
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
          movieId,
          ordering,
          title,
          region,
          language,
          attributes,
          isOriginalTitle,
        ]
      )
    },
  },
  {
    async callBeforeSaveOperations(datasetKey) {
      this.client = await postgreSql.getClient()

      const createMap = async (query) => {
        const { rows } = await this.client.query(query)
        let map = {}
        for (const row of rows) map[row.imdbid] = row.id
        return map
      }

      if (datasetKey === 'title.principals') {
        this.idMap = {
          movies: await createMap('SELECT id, imdbid FROM movies'),
          cast: await createMap('SELECT id, imdbid FROM castAndCrew'),
        }
      }

      if (datasetKey === 'title.akas') {
        this.idMap = {
          movies: await createMap('SELECT id, imdbid FROM movies'),
        }
      }

      await this.client.query('BEGIN')
      return
    },
    async callAfterSaveOperations(datasetKey) {
      await this.client.query('COMMIT')
      this.client.release()
    },
  },
  {
    handleError: (e) => {
      logger.error(e)
    },
    updateProgress: (key, status) => {
      logger.info(
        `the current status of "${key}" is "${status}"`,
        'moviesFiller'
      )
    },
  }
)

module.exports = { moviesFiller }
