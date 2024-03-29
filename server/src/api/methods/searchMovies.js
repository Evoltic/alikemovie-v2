const { ValidationError } = require('../../errors')
const { moviesSearch } = require('../../services/moviesSearch/instance')

async function searchMovies(data = {}, { sendError, sendData }) {
  const { query } = data

  if (typeof query === 'undefined') {
    return sendError(
      new ValidationError(`The "query" field must be specified`, 'query')
    )
  }

  try {
    const movies = await moviesSearch.search(query, 'movie')
    return sendData(movies)
  } catch (e) {
    return sendError(e)
  }
}

module.exports = { searchMovies }