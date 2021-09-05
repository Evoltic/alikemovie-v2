import React from 'react'
import { Router } from '/components/router'
import pages from '/pages'

class App extends React.Component {
  render() {
    return (
      <div>
        <nav>navbar</nav>
        <Router
          CurrentPage={this.props.children}
          TransitionPage={<p>loading a page...</p>}
          allPages={pages}
        />
        <footer>footer</footer>
      </div>
    )
  }
}

let isAppCreated = false
function AppLayer(props) {
  if (isAppCreated) return props.children

  isAppCreated = true
  return <App>{props.children}</App>
}

export { AppLayer as App }
