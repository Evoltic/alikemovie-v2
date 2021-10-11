const { ValidationError } = require('../../errors')
const { moviesSearch } = require('../../services/moviesSearch/instance')

async function searchMovies(data = {}, { sendError, sendData }) {
  const { query } = data

  if (typeof query === 'undefined') {
    return sendError(
      new ValidationError(`The "data.query" field must be specified`, 'query')
    )
  }

  if (query.length <= 1) {
    return sendError(
      new ValidationError(
        `The "data.query" field length must be greater than 1`,
        'query'
      )
    )
  }

  try {
    const movies = await moviesSearch.search(query)
    return sendData(movies)
  } catch (e) {
    return sendError(e)
  }
}

module.exports = { searchMovies }
