require('dotenv').config()
const { setupWebsocketApi, setupContentApi } = require('./api')
const { moviesFiller } = require('./services/moviesFiller/instance')
const { moviesSearch } = require('./services/moviesSearch/instance')

async function startApp() {
  setupContentApi()
  setupWebsocketApi()
}

async function populateDatabase() {
  await moviesFiller.start()
  await moviesSearch.build()
}

if (process.env.IS_AIM_TO_POPULATE_DATABASE === 'true') {
  populateDatabase()
} else {
  startApp()
}
