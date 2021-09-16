import React from 'react'
import { Markup } from './markup'

export class LoadingLine extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: 'initial',
    }
  }

  static getDerivedStateFromProps(props, { status }) {
    if (props.isLoading === false) {
      if (status === 'loading') return { status: 'loaded' }
      else return { status: 'initial' }
    } else {
      if (status === 'loading') return null
      else return { status: 'before-loading' }
    }
  }

  componentDidUpdate() {
    if (this.state.status === 'before-loading') {
      this.setState({ status: 'loading' })
    }
  }

  render() {
    return (
      <Markup status={this.state.status} className={this.props.className || ''}>
        {this.props.children}
      </Markup>
    )
  }
}
