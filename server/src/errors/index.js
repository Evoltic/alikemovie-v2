const { ResourceNotFoundError } = require('./ResourceNotFoundError')
const { InternalError } = require('./InternalError')
const { ValidationError } = require('./ValidationError')
const { AuthenticationError } = require('./AuthenticationError')
const { ConflictError } = require('./ConflictError')
const { AuthorizationError } = require('./AuthorizationError')
const { UnprocessableEntityError } = require('./UnprocessableEntityError')
const { UnsupportedMediaTypeError } = require('./UnsupportedMediaTypeError')
const { mapDomainErrorToHttpResponse } = require('./mapDomainErrorToHttpResponse')

module.exports = {
  ResourceNotFoundError,
  InternalError,
  ValidationError,
  AuthenticationError,
  ConflictError,
  AuthorizationError,
  UnprocessableEntityError,
  UnsupportedMediaTypeError,
  mapDomainErrorToHttpResponse
}
