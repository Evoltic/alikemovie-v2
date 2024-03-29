const fetch = require('node-fetch')
const { ValidationError, ResourceNotFoundError } = require('../../errors')
const { logger } = require('../../functions/logger')
const { postgreSql } = require('../../services/postgreSql/instance')
const { AssetsManager } = require('../../services/assetsManager')
const { Resolver } = require('dns')
const https = require('https')

const postersManager = new AssetsManager({
  groupName: 'posters',
  availableBytes: process.env.AVAILABLE_BYTES_FOR_POSTERS || 100 * 1024 * 1024, // 100mb
  handleLimitError: (e) => {
    logger.warn(e)
    return false
  },
})

const resolver = new Resolver()
resolver.setServers([process.env.DNS_SERVER_OPTIONAL || '9.9.9.9'])

const lookupAddress = (hostname) => {
  return new Promise((resolve, reject) => {
    resolver.resolve4(hostname, (err, addresses) => {
      err ? reject(err) : resolve(addresses)
    })
  })
}

async function downloadPosterFromThirdParty(imdbId) {
  const apiKey = process.env.THEMOVIEDB_API_KEY

  if (typeof apiKey === 'undefined') {
    throw new Error(`process.env.THEMOVIEDB_API_KEY is undefined`)
  }

  // themoviedb.org could be blacklisted in Internet Service Provider DNS
  // in some countries. so we use well-tried DNS instead.
  const [address] = await lookupAddress(`api.themoviedb.org`)
  const agent = new https.Agent({
    lookup: (hostname, options, callback) => {
      callback(null, address, 4)
    },
  })

  const response = await fetch(
    `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
    {
      agent,
    }
  )
  const status = response.status
  if (status !== 200) {
    throw new Error(
      `"themoviedb" answered with status "${status}", expected "200"`
    )
  }

  const body = await response.json()
  const movie =
    body['movie_results'].length > 0
      ? body['movie_results'][0]
      : body['tv_results'][0]

  if (typeof movie === 'undefined') {
    throw new ResourceNotFoundError(imdbId, 'themoviedb')
  }

  const posterPath = movie['poster_path']
  if (typeof posterPath !== 'string') {
    throw new ResourceNotFoundError(imdbId, 'themoviedb posters')
  }

  return fetch(
    `https://www.themoviedb.org/t/p/w300_and_h450_bestv2/${posterPath}`,
    {
      agent,
    }
  ).then((response) => response.buffer())
}

async function getMoviePoster(data = {}, { sendError, sendData }) {
  const { movieId } = data

  if (typeof movieId === 'undefined') {
    return sendError(
      new ValidationError(
        `The "data.movieId" field must be specified`,
        'movieId'
      )
    )
  }

  let imdbId
  try {
    const { rows } = await postgreSql.query(
      'SELECT imdbId FROM movies WHERE id = $1',
      [movieId]
    )

    if (rows.length === 0) {
      return sendError(new ResourceNotFoundError(movieId, 'movies'))
    } else {
      imdbId = rows[0]['imdbid']
    }
  } catch (e) {
    return sendError(e)
  }

  let poster
  try {
    poster = await postersManager.callWithCacheLookup(
      () => downloadPosterFromThirdParty(imdbId),
      movieId,
      Infinity,
      {
        encode: (buffer) => buffer,
        decode: (buffer) => buffer,
      }
    )
  } catch (e) {
    if (!(e instanceof ResourceNotFoundError)) logger.error(e)
    return sendError(e)
  }

  if (!poster) return sendError(new ResourceNotFoundError(imdbId, 'posters'))
  else
    return sendData(poster, {
      'Content-Type': 'image/jpeg',
      'Cache-control': `public, max-age=${30 * 24 * 60 * 60}`,
    })
}

module.exports = { getMoviePoster }
