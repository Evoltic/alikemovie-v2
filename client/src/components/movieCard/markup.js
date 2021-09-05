import React from 'react'

export const Markup = (props) => {
  const { title, startyear } = props

  return (
    <div className="movie-card">
      <p className="movie-card__title">{title}</p>
      <p className="movie-card__year">{startyear}</p>
    </div>
  )
}
