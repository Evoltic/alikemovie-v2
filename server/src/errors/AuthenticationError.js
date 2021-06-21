const { DomainError } = require('./DomainError')

// example:
// new AuthenticationError('The password is incorrect', 'oneTimePassword')

class AuthenticationError extends DomainError {
  constructor(messageAboutWhatHappened, nameOfThingThatCausedError) {
    super(messageAboutWhatHappened)
    this.data = { subject: nameOfThingThatCausedError }
  }
}

module.exports = { AuthenticationError }
