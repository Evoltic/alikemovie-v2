const express = require('express')
const bodyParser = require('body-parser')
const { mapDomainErrorToHttpResponse } = require('../errors')
const { logger } = require('../functions/logger')

const routes = []

function setupContentApi() {
  const port = process.env.CONTENT_SERVER_PORT
  const app = express()

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  for (const item of routes) {
    const { route, method, handler } = item

    app[method](route, (req, res) => {
      const sendData = async (data, { statusCode, ...headers } = {}) => {
        res.status(statusCode || 200)
        res.set(headers)
        res.send(data)
      }

      const sendError = (err) => {
        const { statusCode, ...errorInfo } = mapDomainErrorToHttpResponse(err)
        res.status(statusCode || 500).send(errorInfo)
      }

      const data = { ...req.params, ...req.body, ...req.query }

      handler(data, { sendData, sendError })
    })
  }

  app.listen(port, () => {
    logger.info(`the content server is listening on port ${port}`)
  })
}

module.exports = { setupContentApi }
