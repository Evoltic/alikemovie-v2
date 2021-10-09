import React from 'react'
import { App } from '/components/app'
import './index.scss'

export default () => {
  return (
    <App>
      <main className="page_home">
        <div className="page__section">
          <div className="page__section-content">
            <div className="page__message">
              <h1 className="page__title">Main Page</h1>
              <p className="page__text">Search similar movies</p>
            </div>
          </div>
        </div>
      </main>
    </App>
  )
}
