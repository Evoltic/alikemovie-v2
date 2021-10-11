class Log {
  constructor(message, level, context = 'default') {
    this.message = message
    this.level = level
    this.context = context
    this.timestamp = new Date()
  }
}

class Logger {
  constructor(mode) {
    this.shouldBeLoggedNow = true
  }

  get logs() {
    return {
      push: (log) => {
        if (this.shouldBeLoggedNow) {
          console.log(`\r${log.context}: ${log.message}\r`)
        }
        // could be sent somewhere or save
      },
    }
  }

  status(message, context) {
    this.logs.push(new Log(message, 'status', context))

    return (value) => {
      this.logs.push(new Log(value, 'status', context))
    }
  }

  info(message, context) {
    this.logs.push(new Log(message, 'info', context))
  }

  error(err) {
    this.logs.push(
      new Log(`message: ${err.message}.\n trace: ${err.stack}`, 'error')
    )
  }

  warn(message, context) {
    this.logs.push(new Log(message, 'warning', context))
  }
}

const logger = new Logger(process.env.NODE_ENV || 'dev')

module.exports = { logger }
