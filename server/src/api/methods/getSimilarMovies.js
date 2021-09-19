const { ValidationError } = require('../../errors')
const { similarMovies } = require('../../services/similarMovies/instance')

async function getSimilarMovies(data = {}, { sendError, sendData }) {
  const { movieId } = data
  if (typeof movieId === 'undefined') {
    return sendError(
      new ValidationError(
        `The "data.movieId" field must be specified`,
        'movieId'
      )
    )
  }

  try {
    const movies = await similarMovies.findById(movieId)
    return sendData(movies)
  } catch (e) {
    return sendError(e)
  }
}

module.exports = { getSimilarMovies }
