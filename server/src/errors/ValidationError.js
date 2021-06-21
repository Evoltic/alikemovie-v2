const { DomainError } = require('./DomainError')

// example:
// new ValidationError(`The email doesn't match the required pattern`, 'email')

class ValidationError extends DomainError {
  constructor(messageDescribingWhyValidationFailed, nameOfThingThatCausedError) {
    super(`${messageDescribingWhyValidationFailed}`)
    this.data = { subject: nameOfThingThatCausedError }
  }
}

module.exports = { ValidationError }
