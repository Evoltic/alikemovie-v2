const { DomainError } = require('./DomainError')

// example
// new AuthorizationError('example-id-cvbhgf654adfgd', 'articles')

class AuthorizationError extends DomainError {
  constructor(exactThingThatCantBeAccessed, placeWhereThingCantBeAccessed) {
    const item = exactThingThatCantBeAccessed
    const group = placeWhereThingCantBeAccessed

    super(`Access denied. No rights to "${item}"`)
    this.data = { item, group }
  }
}

module.exports = { AuthorizationError }
