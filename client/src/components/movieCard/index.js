import React from 'react'
import { Markup } from './markup'

export const MovieCard = class extends React.Component {
  render() {
    return <Markup {...this.props} />
  }
}
