const { DomainError } = require('./DomainError')

// example:
// new ResourceNotFoundError('example-id-ag6d654xb', 'movies')

class ResourceNotFoundError extends DomainError {
  constructor(exactThingThatCantBeAccessed, placeWhereThingCantBeFound) {
    super(`"${exactThingThatCantBeAccessed}" not found.`)
    this.data = {
      item: exactThingThatCantBeAccessed,
      group: placeWhereThingCantBeFound
    }
  }
}

module.exports = { ResourceNotFoundError }
