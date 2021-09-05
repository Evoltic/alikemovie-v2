import { Pieces } from '/functions/pieces'

// TODO:
//  implement "websocket ping pong" and reconnect on connection lost;
//  handle a situation when the worker is removed and the state is loosed:
//  if the state is loosed and the worker spawned without knowing about
//  previous incoming responses - then the new worker would assume those
//  responses for the latest requests and not for the "old".

class ServerApi {
  constructor(handleGeneralError) {
    this.handleGeneralError = handleGeneralError || (() => {})
    this.actions = {}
  }

  handleResponse(event) {
    try {
      const { actionId, response } = JSON.parse(event.data)

      if (!this.actions[actionId]) return
      const { callback } = this.actions[actionId]

      const cleanup = () => delete this.actions[actionId]

      if (response.type === 'raw') {
        cleanup()
        return callback(null, response.data, true)
      }
      if (response.type === 'error') {
        cleanup()
        return callback(response.data, null, true)
      }

      const prepareForWorkingWithPieces = () => {
        this.actions[actionId].pieces = new Pieces(
          (currentState, isLastUpdate) => {
            callback(null, currentState, isLastUpdate)
            if (isLastUpdate) cleanup()
          }
        )
      }

      if (!this.actions[actionId].pieces) prepareForWorkingWithPieces()
      const { pieces } = this.actions[actionId]

      switch (response.type) {
        case 'key:piece':
          return pieces.setSchema(response.data)
        case 'piece:value':
          return pieces.setValue(response.data)
        case 'piece:piece':
          return pieces.clarify(response.data)
      }
    } catch (e) {
      this.handleGeneralError(e)
    }
  }

  connect() {
    this.socket = new WebSocket(process.env.WEBSOCKET_API_URL)
    this.socket.onmessage = (event) => this.handleResponse(event)
  }

  async ensureConnectionIsOpen() {
    // socket.readyState:
    // CONNECTING 0
    // OPEN 1
    // CLOSING 2
    // CLOSED	3

    const state = this.socket ? this.socket.readyState : null

    if (state !== 1) {
      if (state !== 0) this.connect()

      await new Promise((resolve, reject) => {
        const handleOpen = () => {
          this.socket.removeEventListener('open', handleOpen)
          resolve()
        }
        this.socket.addEventListener('open', handleOpen)

        setTimeout(
          () => reject(new Error(`given time to open a socket exceeded`)),
          5000
        )
      })
    }
  }

  getNewId() {
    if (typeof this.nextId === 'undefined') this.nextId = 0
    else this.nextId++

    return this.nextId
  }

  perform(methodName, data = {}, callback) {
    const actionId = this.getNewId()
    this.actions[actionId] = { callback }

    this.ensureConnectionIsOpen()
      .then(() =>
        this.socket.send(JSON.stringify({ methodName, actionId, data }))
      )
      .catch((err) => {
        delete this.actions[actionId]
        callback(err)
      })
  }
}

export { ServerApi }
