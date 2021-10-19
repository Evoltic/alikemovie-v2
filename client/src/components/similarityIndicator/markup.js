import React from 'react'
import './index.scss'

export function Markup(props) {
  const { word, color, percent, className = '' } = props
  return (
    <p
      className={`similarity-indicator ${className}`}
      title={`${percent.toFixed(2)}%`}
    >
      <span className={'similarity-indicator__label'}>{word}</span>
      <span
        className={'similarity-indicator__circle'}
        style={{ backgroundColor: `rgb(${color})` }}
      />
    </p>
  )
}
