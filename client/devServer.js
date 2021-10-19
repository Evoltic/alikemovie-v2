const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const pages = require('./src/pages')

let webpackConfigs = require('./webpackConfig')

webpackConfigs = webpackConfigs.map((config) => {
  return {
    ...config,
    watchOptions: {
      ignored: /node_modules/,
    },
    optimization: {},
  }
})

function start() {
  const app = express()
  const compiler = webpack(webpackConfigs)

  app.use(
    webpackDevMiddleware(compiler, {
      serverSideRender: true,
    })
  )

  app.use((req, res) => {
    const outputFileSystem = res.locals.webpack.devMiddleware.outputFileSystem

    const page = pages.find((page) => page.route.test(req.path))
    if (!page) return

    res.send(
      outputFileSystem.readFileSync(__dirname + `/dist/${page.source}.html`, {
        encoding: 'utf8',
      })
    )
  })

  const port = process.env.PORT || 8000
  app.listen(port, () => console.log(`\nthe server is listening on ${port} \n`))
}
start()
