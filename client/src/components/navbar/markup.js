import React from 'react'
import { SearchBox } from '/components/searchBox'
import { Link } from '/components/router'
import logo from '/assets/images/alikemovie-logo.png'
import './index.scss'

export const Markup = ({ className = '' }) => {
  return (
    <navbar className={`${className} navbar`}>
      <div className="navbar__content">
        <Link className="navbar__logo" to="/">
          <img className="navbar__logo-image" src={logo} alt="alikemovie" />
        </Link>
        <SearchBox />
      </div>
    </navbar>
  )
}
