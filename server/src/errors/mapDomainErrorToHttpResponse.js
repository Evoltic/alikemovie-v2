const { ResourceNotFoundError } = require('./ResourceNotFoundError')
const { ValidationError } = require('./ValidationError')
const { ConflictError } = require('./ConflictError')
const { AuthenticationError } = require('./AuthenticationError')
const { AuthorizationError } = require('./AuthorizationError')
const { UnprocessableEntityError } = require('./UnprocessableEntityError')
const { UnsupportedMediaTypeError } = require('./UnsupportedMediaTypeError')
const { InternalError } = require('./InternalError')

function getResponse(statusCode, errorName, error = {}) {
  return {
    statusCode: statusCode,
    errorName: errorName,
    message: error.message,
    ...error.data
  }
}

function mapDomainErrorToHttpResponse(error) {
  switch (error.constructor) {
    case ResourceNotFoundError:
      return getResponse(404, 'Not Found', error)
    case ValidationError:
      return getResponse(422, 'Unprocessable Entity', error)
    case ConflictError:
      return getResponse(409, 'Conflict', error)
    case AuthenticationError:
      return getResponse(401, 'Unauthorized', error)
    case AuthorizationError:
      return getResponse(403, 'Forbidden', error)
    case UnprocessableEntityError:
      return getResponse(422, 'Unprocessable Entity', error)
    case UnsupportedMediaTypeError:
      return getResponse(415, 'Unsupported Media Type', error)
    case InternalError:
      return getResponse(500, 'Internal Server Error')
    default:
      return getResponse(500, 'Internal Server Error')
  }
}

module.exports = { mapDomainErrorToHttpResponse }
