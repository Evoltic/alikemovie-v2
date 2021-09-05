import React from 'react'
import { App } from '/components/app'
import { Link } from '/components/router'

export default () => {
  return (
    <App>
      <Link to={'/'}>Home</Link>
      <div>404</div>
    </App>
  )
}
