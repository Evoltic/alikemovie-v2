import React from 'react'
import './index.scss'

export const Markup = ({ className = '' }) => {
  return (
    <svg className={`${className} loading-circle`} viewBox="0 0 200 200">
      <circle className="loading-circle__circle" cx="100" cy="100" r="80" />
    </svg>
  )
}
