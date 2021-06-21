const { DomainError } = require('./DomainError')

// example:
// new UnprocessableEntity(
//   'Not enough amount on the account balance to complete the transaction',
//   'balance'
// )

class UnprocessableEntityError extends DomainError {
  constructor(messageDescribingReason, veryShortReason) {
    super(messageDescribingReason)
    this.data = { reason: veryShortReason }
  }
}

module.exports = { UnprocessableEntityError }
