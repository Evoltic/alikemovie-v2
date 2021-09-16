import React from 'react'
import { SearchBox } from '/components/searchBox'
import { Link } from '/components/router'
import HomeIcon from '/assets/icons/home.svg'
import './index.scss'

export const Markup = () => {
  return (
    <navbar className="navbar">
      <div className="navbar__content">
        <Link className="navbar__homepage-link" to="/">
          <HomeIcon className="navbar__homepage-icon" />
        </Link>
        <SearchBox />
      </div>
    </navbar>
  )
}
