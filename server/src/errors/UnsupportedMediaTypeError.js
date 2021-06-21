const { DomainError } = require('./DomainError')

class UnsupportedMediaTypeError extends DomainError {
  constructor(message, expectedMediaType) {
    super(message)
    this.data = { expectedMediaType }
  }
}

module.exports = { UnsupportedMediaTypeError }