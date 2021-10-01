import React from 'react'
import { Router } from '/components/router'
import pages from '/pages'
import { Navbar } from '/components/navbar'

let isTheOnlyAppCreated = false
let updateTheOnlyAppState = () => {
  console.warn(`updateTheOnlyAppState must be defined inside the app`)
}

class App extends React.Component {
  constructor(props) {
    super(props)

    const { children, ...rest } = props

    this.state = { ...rest }
    updateTheOnlyAppState = (state) => this.setState(state)
  }

  render() {
    return (
      <div className={this.state.className || ''}>
        <Router
          Header={<Navbar />}
          CurrentPage={this.props.children}
          TransitionPage={<p>loading a page...</p>}
          allPages={pages}
        />
      </div>
    )
  }
}

class AppLayer extends React.Component {
  constructor(props) {
    super(props)
    const { children, ...rest } = props

    this.isThisTheApp = !isTheOnlyAppCreated
    if (isTheOnlyAppCreated) updateTheOnlyAppState(rest)

    isTheOnlyAppCreated = true
  }

  render() {
    const { children = React.Fragment, ...rest } = this.props
    return this.isThisTheApp ? <App {...rest}>{children}</App> : children
  }
}

export { AppLayer as App }
