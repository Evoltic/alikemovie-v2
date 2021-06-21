const { DomainError } = require('./DomainError')

class InternalError extends DomainError {
  constructor(error) {
    super(error.message)
    this.data = { error }
  }
}

module.exports = { InternalError }
