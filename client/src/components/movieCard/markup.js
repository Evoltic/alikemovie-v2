import React from 'react'
import './index.scss'
import { SmartImage } from '/components/smartImage'
import { SimilarityIndicator } from '/components/similarityIndicator'

export const Markup = (props) => {
  const {
    id,
    title,
    startyear,
    endyear,
    genres,
    type,
    score,
    maxScore,
    isLoading,
  } = props

  return (
    <div className="movie-card">
      <div className="movie-card__aside">
        {id && (
          <SmartImage
            className="movie-card__cover"
            src={process.env.CONTENT_API_URL + `/movies/${id}/poster`}
            alt={`${title}`}
          />
        )}
        {type === 'tvSeries' && (
          <p className="movie-card__tv-label" title="TV Series">
            tv
          </p>
        )}
      </div>
      <div className="movie-card__main">
        <h2 className="movie-card__title">
          <span className="movie-card__title-name">{title}</span>
          <span className="movie-card__title-year">
            {(startyear || '') + (endyear ? ` - ${endyear}` : '')}
          </span>
        </h2>
        <div className="movie-card__chips">
          {(isLoading ? ['', ''] : genres || []).map((genre, i) => (
            <p className="movie-card__chip" key={genre || i}>
              {genre}
            </p>
          ))}
        </div>
        {score && (
          <SimilarityIndicator
            className="movie-card__indicator"
            value={score}
            maxValue={maxScore}
            minValue={0}
            words={[
              'Exact match',
              'Very similar',
              'Pretty similar',
              'Quite similar',
              'A bit similar',
              '',
            ]}
          />
        )}
      </div>
    </div>
  )
}
