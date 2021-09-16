import React from 'react'
import './index.scss'

export const Markup = ({ status, className, children }) => {
  return (
    <div className={`${className} loading-line loading-line_status_${status}`}>
      {children}
      {status !== 'before-loading' && status !== 'initial' && (
        <div className="loading-line__line" />
      )}
    </div>
  )
}
