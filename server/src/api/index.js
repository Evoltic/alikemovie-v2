const WebSocket = require('ws')
const {
  mapDomainErrorToHttpResponse,
  UnsupportedMediaTypeError,
  ValidationError,
  ResourceNotFoundError
} = require('../errors')
const { PiecesManager } = require('../functions/piecesManager')
const { logger } = require('../functions/logger')
const methods = require('./methods')

const constructSenders = (send, actionId) => ({
  sendData: data => send({ actionId, response: { type: 'raw', data } }),
  sendError: err =>
    send({
      actionId,
      response: {
        type: 'error',
        data: mapDomainErrorToHttpResponse(err)
      }
    }),
  PiecesSender: class {
    constructor(schema) {
      return new PiecesManager(schema, {
        'key:piece': data =>
          send({ actionId, response: { type: 'key:piece', data } }),
        'piece:value': data =>
          send({ actionId, response: { type: 'piece:value', data } }),
        'piece:piece': data =>
          send({ actionId, response: { type: 'piece:piece', data } })
      })
    }
  }
})

function handleMessageFromClient(
  clientMessage,
  sendMessageToClient,
  httpRequestInfo,
  callbackOnConnectionClose
) {
  let jsonClientMessage
  try {
    jsonClientMessage = JSON.parse(clientMessage)
  } catch (e) {
    return constructSenders(sendMessageToClient).sendError(
      new UnsupportedMediaTypeError('The message must be in JSON', 'JSON')
    )
  }

  const { methodName, actionId, data } = jsonClientMessage

  const senders = constructSenders(sendMessageToClient, actionId)

  if (typeof methodName === 'undefined') {
    return senders.sendError(
      new ValidationError(
        `The message must include the "methodName" field`,
        'methodName'
      )
    )
  }
  if (typeof actionId === 'undefined') {
    return senders.sendError(
      new ValidationError(
        `The message must include the "actionId" field`,
        'actionId'
      )
    )
  }
  if (typeof methods[methodName] === 'undefined') {
    return senders.sendError(new ResourceNotFoundError(methodName, 'methods'))
  }

  methods[methodName](data, senders, httpRequestInfo, callbackOnConnectionClose)
}

function setupApi() {
  const port = process.env.PORT

  const websocketServer = new WebSocket.Server({ port }, () =>
    logger.info(`the server listening on port ${port}`)
  )

  websocketServer.on('connection', (websocket, request) => {
    const send = message => websocket.send(JSON.stringify(message))
    const callbackOnConnectionClose = fn => websocket.on('close', fn)

    websocket.on('message', message =>
      handleMessageFromClient(message, send, request, callbackOnConnectionClose)
    )

    // pings a client in interval and waits for a response (pong) to be
    // sure that a connection is still open
    let isWaitingForPong = false
    const pingClient = async () => {
      websocket.ping()
      isWaitingForPong = true
      await new Promise(resolve => setTimeout(resolve, 10000))
      if (isWaitingForPong) websocket.terminate()
      else pingClient()
    }
    pingClient()
    websocket.on('pong', () => (isWaitingForPong = false))

    // the same, but vice versa: the server is checked by a client.
    // on every ping the server responds (pongs), so the client could know
    // if a connection is still open
    websocket.on('ping', () => websocket.pong())
  })
}

module.exports = { setupApi }
