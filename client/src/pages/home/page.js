import React from 'react'
import { App } from '/components/app'
import './index.scss'

export default () => {
  return (
    <App className="app__home">
      <main className="page_home">
        <div className="page__section">
          <div className="page__section-content">
            <p className="page__text">
              created by{' '}
              <a
                className="page__link"
                href="https://evoltic.github.io/"
                target="_blank"
              >
                evoltic
              </a>
            </p>
          </div>
        </div>
      </main>
    </App>
  )
}
