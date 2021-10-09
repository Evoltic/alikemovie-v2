import React from 'react'
import { Markup } from './markup'

export class Navbar extends React.Component {
  render() {
    return <Markup {...this.props} />
  }
}
