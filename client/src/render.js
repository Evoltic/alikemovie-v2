const React = require('react')
const ReactDOMClient = require('react-dom/index')

const isClient = typeof document !== 'undefined'

module.exports = {
  render(Component) {
    if (isClient) {
      ReactDOMClient.hydrate(<Component />, document.getElementById('app'))
    } else {
      // ReactDOMServer is defined in webpackConfig.js
      this.componentRenderedToHtmlString = ReactDOMServer.renderToString(<Component />)
    }
  }
}
