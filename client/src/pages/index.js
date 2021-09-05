// https://medium.com/front-end-weekly/webpack-and-dynamic-imports-doing-it-right-72549ff49234
module.exports = [
  {
    route: new RegExp('/$'),
    source: 'pages/home',
    entryFile: 'pages/home/render',
    importPage: () => import('/pages/home/page').then(({ default: p }) => p),
  },
  {
    route: new RegExp('/movies/[^/]+$'),
    source: 'pages/movie',
    entryFile: 'pages/movie/render',
    importPage: () => import('/pages/movie/page').then(({ default: p }) => p),
  },
  {
    route: new RegExp('/404$'),
    source: 'pages/404',
    entryFile: 'pages/404/render',
    importPage: () => import('/pages/404/page').then(({ default: p }) => p),
  },
]
