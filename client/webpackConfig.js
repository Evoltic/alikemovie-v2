const path = require('path')
const fs = require('fs')
const Dotenv = require('dotenv-webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactDOMServer = require('react-dom/server')
const pages = require('./src/pages')

console.time('clearing /dist directory took')
fs.rmSync(__dirname + '/dist', { recursive: true, force: true })
console.timeEnd('clearing /dist directory took')

console.time('searching for workers files took')
const workers = glob.sync('**/*.worker.js', { cwd: __dirname + '/src' })
console.timeEnd('searching for workers files took')

console.log('\n')

const commonConfig = {
  mode: process.env.NODE_ENV || 'production',
  context: path.resolve(__dirname, './src'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: false,
    globalObject: 'this',
    publicPath: '/',
  },
}

const mainConfig = {
  ...commonConfig,
  target: 'web',
  entry: {
    ...pages.reduce(
      (acc, page) => ({
        ...acc,
        [page.source]: { import: `/${page.entryFile}` },
      }),
      {}
    ),
  },
  optimization: {
    splitChunks: {
      filename: '[name].[contenthash].js',

      chunks: 'all',

      // The minimum times must a module be shared among chunks before splitting.
      minChunks: 1,

      // Minimum size, in bytes, for a chunk to be generated.
      minSize: 0,

      // Size threshold at which splitting is enforced and other restrictions
      // (minRemainingSize, maxAsyncRequests, maxInitialRequests) are ignored.
      enforceSizeThreshold: 0,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    ...pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          filename: `${page.source}.html`,
          chunks: [page.source],
          templateContent: ({ compilation, htmlWebpackPlugin }) => {
            // prerender

            let jsSource = ''

            const prefix = htmlWebpackPlugin.files.publicPath

            const jsFiles = [...htmlWebpackPlugin.files.js].reverse()
            for (const path of jsFiles) {
              const file = path.replace(new RegExp(`^(${prefix})`), '')
              jsSource += compilation.assets[file].source()
            }

            const renderApp = new Function(
              'ReactDOMServer',
              `${jsSource} return this.componentRenderedToHtmlString`
            )
            const componentInHtmlString = renderApp(ReactDOMServer)

            return `
              <html>
                <body>
                  <div id="app">${componentInHtmlString}</div>
                </body>
              </html>
            `
          },
        })
    ),
    new Dotenv(),
  ],
}

const workersConfig = {
  ...commonConfig,
  target: 'webworker',
  entry: {
    ...workers.reduce(
      (acc, path) => ({
        ...acc,
        [path.slice(0, -3)]: { import: `/${path}` },
      }),
      {}
    ),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [new Dotenv()],
}

module.exports = [mainConfig, workersConfig]
