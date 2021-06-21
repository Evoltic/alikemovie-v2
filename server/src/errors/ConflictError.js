const { DomainError } = require('./DomainError')

// example:
// new ConflictError('The resource with the provided slug already exists', 'slug')

class ConflictError extends DomainError {
  constructor(messageAboutWhatHappened, nameOfThingThatCausedError) {
    super(`${messageAboutWhatHappened}`)
    this.data = { subject: nameOfThingThatCausedError }
  }
}

module.exports = { ConflictError }
