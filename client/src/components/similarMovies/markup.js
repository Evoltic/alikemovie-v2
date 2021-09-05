import React from 'react'
import { MovieCard } from '/components/movieCard'

export const Markup = (props) => {
  const { items = [], isPending, isNotFound, isUnknownError } = props

  return (
    <div className="similar-movies">
      {isPending && <p className="similar-movies__loader">loading...</p>}
      {isNotFound && <p className="similar-movies__not-found">not found</p>}
      {isUnknownError && (
        <p className="similar-movies__not-found">unknown error</p>
      )}
      {items.map((item) => (
        <div className="similar-movies__item">
          <MovieCard {...item} key={item.id} />
        </div>
      ))}
    </div>
  )
}
