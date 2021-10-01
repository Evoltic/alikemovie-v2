import React from 'react'
import './index.scss'
import { SmartImage } from '/components/smartImage'

export const Markup = (props) => {
  const { id, title, startyear, endyear, genres } = props

  return (
    <div className="movie-card">
      <div className="movie-card__aside">
        <SmartImage
          className="movie-card__cover"
          src={process.env.CONTENT_API_URL + `/movies/${id}/poster`}
          alt={`${title}`}
        />
      </div>
      <div className="movie-card__main">
        <h2 className="movie-card__title">
          <span className="movie-card__title-name">{title}</span>
          <span className="movie-card__title-year">
            {(endyear ? `${endyear} - ` : '') + startyear}
          </span>
        </h2>
        <div className="movie-card__chips">
          {genres &&
            genres.map((genre) => (
              <p className="movie-card__chip" key={genre}>
                {genre}
              </p>
            ))}
        </div>
      </div>
    </div>
  )
}
