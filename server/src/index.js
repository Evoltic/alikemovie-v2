require('dotenv').config()
const { setupWebsocketApi, setupContentApi } = require('./api')
const { moviesFiller } = require('./services/moviesFiller/instance')
const { moviesSearch } = require('./services/moviesSearch/instance')

async function startApp() {
  if (process.env.IS_FIRST_LAUNCH === 'true') {
    // TODO: make this process on interval. but ensure it wont block the only thread.
    await moviesFiller.start()
    await moviesSearch.build()
  }

  setupContentApi()
  setupWebsocketApi()
}

startApp()
