import React from 'react'
import { Router } from '/components/router'
import pages from '/pages'
import { Navbar } from '/components/navbar'
import './index.scss'

let isTheOnlyAppCreated = false
let updateTheOnlyAppState = () => {
  console.warn(`updateTheOnlyAppState must be defined inside the app`)
}

class App extends React.Component {
  constructor(props) {
    super(props)

    const { children, ...rest } = props

    this.state = { ...rest }
    updateTheOnlyAppState = (state) => {
      this.setState((oldState) => {
        let emptyKeys = {}
        for (const key in oldState) emptyKeys[key] = undefined
        // empty keys needed because react merging a state, not overwriting it
        return { ...emptyKeys, ...state }
      })
    }
  }

  render() {
    return (
      <Router
        className={this.state.className || 'app'}
        pageClassName={'app__page'}
        Header={<Navbar />}
        TransitionPage={
          <p className="app__transition-background">loading a page...</p>
        }
        CurrentPage={this.props.children}
        allPages={pages}
        shouldBeMultiPaging={true}
      />
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
