import React from 'react'
import { MovieCard } from '/components/movieCard'
import './index.scss'

export const Markup = (props) => {
  const { items = [], isPending, isNotFound, isUnknownError } = props

  return (
    <div className="similar-movies">
      {isNotFound && (
        <div className="similar-movies__error-box">
          <h1 className="similar-movies__error-title">Not Found</h1>
        </div>
      )}
      {isUnknownError && (
        <div className="similar-movies__error-box">
          <h1 className="similar-movies__error-title">Unknown Error</h1>
        </div>
      )}
      {(isPending ? [{}, {}, {}, {}] : items).map((item, i) => (
        <div className="similar-movies__item" key={item.id || i}>
          <MovieCard {...item} isLoading={isPending} />
        </div>
      ))}
    </div>
  )
}
