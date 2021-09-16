import React from 'react'
import { SimilarMovies } from '/components/similarMovies'
import { App } from '/components/app'
import './index.scss'

export default () => {
  const movieId =
    typeof location === 'undefined'
      ? undefined
      : location.pathname.split('/').slice(-1)[0]

  return (
    <App className="page_movie">
      <div className="page__section">
        <div className="page__section-content">
          <SimilarMovies movieId={movieId} />
        </div>
      </div>
    </App>
  )
}
