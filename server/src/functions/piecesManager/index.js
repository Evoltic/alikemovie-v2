// How to use:

// Create an instance of PiecesManager.
// The returned value by PiecesManager constructor is "controls".
// "Controls" is an Object or Array that includes a set of two methods for
// every key/index.
// The two methods are "setValue" and "clarify".
// Call "clarify" method to set a schema if needed.
// Call "setValue" method when you know a final value.

// So, the example flow could be:
// 1. Defining the main one level deep schema by creating an instance of PiecesManager;
// 2. Clarifying values written in the main schema while waiting for a final value
//    (e.g. while waiting for a response from a database);
// 3. Set a final value when the value is known.
// e.g.
// 1. const { exampleObj } = new PiecesManager({ exampleObj: Object }, listeners)
// 2. const { deepKey } = exampleObj.clarify({ deepKey: String })
// 3. deepKey.setValue('deep value')

// Worth to note:
// - The "controls" returned by the constructor are the same as the "controls"
//   returned by the "clarify" method.
// - A schema (which is passed to the constructor or "clarify" method)
//   must be one level deep.
// - On every "setValue" / "clarify" call a corresponding listener is invoked.
// - There is three types of listeners "key:piece", "piece:value", "piece:piece".
// - To delay a corresponding listener invocation pass a Boolean (true) to
//   the second argument of "setValue" / "clarify" method. The listener wont
//   be invoked this time, instead, the information will be grouped and sent
//   with the next "setValue" / "clarify" call.

class PiecesManager {
  constructor(schema, listeners = {}) {
    this.listeners = listeners
    this.groups = { 'piece:value': {}, 'piece:piece': {} }

    const { controls, createdPieces } = this.createPieces(schema)

    const map = this.mapKeyWithId(createdPieces, Array.isArray(schema))
    this.listeners['key:piece'](map)

    return controls
  }

  mapKeyWithId(pieces, shouldBeArray) {
    let map = {}

    if (!shouldBeArray) for (const piece of pieces) map[piece.key] = piece.id
    else map = pieces.map(piece => piece.id)

    return map
  }

  supplyGroup(key) {
    this.listeners[key](this.groups[key])
    this.groups[key] = {}
  }

  handleSetValue(pieceId, value, isLastInGroup = true) {
    this.groups['piece:value'][pieceId] = value
    if (isLastInGroup) this.supplyGroup('piece:value')
  }

  handleClarify(pieceId, schema, isLastInGroup = true) {
    const { controls, createdPieces } = this.createPieces(schema)

    const map = this.mapKeyWithId(createdPieces, Array.isArray(schema))

    this.groups['piece:piece'][pieceId] = map
    if (isLastInGroup) this.supplyGroup('piece:piece')

    return controls
  }

  getNewId() {
    if (typeof this.nextId === 'undefined') this.nextId = 0
    else this.nextId++

    return this.nextId
  }

  createPieces(schema) {
    let controls = {}
    let createdPieces = []

    for (const key in schema) {
      const pieceId = this.getNewId()

      createdPieces.push({ id: pieceId, key })

      controls[key] = {}

      const setValue = (value, shouldBeGroupedWithNext) =>
        this.handleSetValue(pieceId, value, !shouldBeGroupedWithNext)

      const clarify = (schema, shouldBeGroupedWithNext) =>
        this.handleClarify(pieceId, schema, !shouldBeGroupedWithNext)

      controls[key].setValue = setValue
      if (schema[key] === Object) {
        controls[key].clarify = clarify
      } else if (schema[key] === Array) {
        controls[key].clarify = (...args) => Object.values(clarify(...args))
      }
    }

    return { controls, createdPieces }
  }
}

module.exports = { PiecesManager }
