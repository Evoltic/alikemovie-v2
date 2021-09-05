import React from 'react'
import { SimilarMovies } from '/components/similarMovies'
import { App } from '/components/app'
import { Link } from '/components/router'

export default () => {
  const movieId =
    typeof location === 'undefined'
      ? undefined
      : location.pathname.split('/').slice(-1)[0]

  return (
    <App>
      <Link to={'/'}>Home</Link>
      <Link to={'/404'}>404</Link>
      <h1>Movie Page</h1>
      <SimilarMovies movieId={movieId} />
    </App>
  )
}
