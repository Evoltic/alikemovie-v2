class Pieces {
  constructor(callOnStateUpdate = () => {}) {
    this.callAfterStateUpdated = () => {
      const isLastUpdate = Object.keys(this.valueSetters).length === 0
      callOnStateUpdate(this.currentState, isLastUpdate)
    }

    this.currentState = {}
    this.valueSetters = {}
  }

  updateState(origin, key, value) {
    origin[key] = value
    this.callAfterStateUpdated()
    return origin[key]
  }

  setSchema(schema) {
    for (const key in schema) {
      const pieceId = schema[key]
      this.currentState[key] = undefined

      this.valueSetters[pieceId] = value => {
        return this.updateState(this.currentState, key, value)
      }
    }
  }

  clarify(pieceIdSchemaPairs) {
    for (const parentPieceId in pieceIdSchemaPairs) {
      const schema = pieceIdSchemaPairs[parentPieceId]

      let elements = Array.isArray(schema) ? [] : {}
      for (const key in schema) elements[key] = undefined
      const origin = this.valueSetters[parentPieceId](elements)
      delete this.valueSetters[parentPieceId]

      for (const key in schema) {
        const childPieceId = schema[key]

        this.valueSetters[childPieceId] = value => {
          return this.updateState(origin, key, value)
        }
      }
    }
  }

  setValue(pieceIdValuePairs) {
    for (const pieceId in pieceIdValuePairs) {
      const value = pieceIdValuePairs[pieceId]
      const setter = this.valueSetters[pieceId]

      delete this.valueSetters[pieceId]
      setter(value)
    }
  }
}

export { Pieces }
