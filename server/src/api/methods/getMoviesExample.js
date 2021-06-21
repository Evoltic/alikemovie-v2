function getMoviesExample(data, senders, httpRequestInfo) {
  const { sendError, sendData, PiecesSender } = senders

  const {
    movieName,
    thumbnail,
    similarMovies,
    similarMoviesDeep
  } = new PiecesSender({
    movieName: String,
    thumbnail: String,
    similarMovies: Array,
    similarMoviesDeep: Array
  })

  movieName.setValue('avengers')
  thumbnail.setValue('https://pictures.com/avengers-thumbnail')

  const [similarMovie1, similarMovie2] = similarMovies.clarify([String, String])

  similarMovie1.setValue('avengers 2', true)
  similarMovie2.setValue('avengers 3')

  const [similarMovieDeep1, similarMovieDeep2] = similarMoviesDeep
    .clarify([Object, Object])
    .map(obj => obj.clarify({ movieName: String, actor: String }))

  similarMovieDeep1.movieName.setValue('godzilla')
  similarMovieDeep1.actor.setValue('vin diesel')

  similarMovieDeep2.movieName.setValue('godzilla 2')
  similarMovieDeep2.actor.setValue('vin diesel jr')
}

module.exports = { getMoviesExample }
