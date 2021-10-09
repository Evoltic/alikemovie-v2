import React from 'react'
import { App } from '/components/app'
import { Link } from '/components/router'
import './index.scss'

export default () => {
  return (
    <App>
      <main className="page_404">
        <div className="page__section">
          <div className="page__section-content">
            <div className="page__message">
              <h1 className="page__title">Not Found 404</h1>
              <Link className="page__link" to={'/'}>
                Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    </App>
  )
}
