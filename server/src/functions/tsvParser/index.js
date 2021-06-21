const { Transform } = require('stream')

class TsvParser extends Transform {
  constructor(options = {}) {
    super(options)

    this.line = ''
    this.isFirstLine = true

    const { shouldHeaderBeIncluded = true } = options
    this.shouldHeaderBeIncluded = shouldHeaderBeIncluded
  }

  _transform(chunk, encoding, callback) {
    try {
      const lines = chunk.toString().split('\n')

      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i]
        const nextLine = lines[i + 1]

        this.line += currentLine

        if (typeof nextLine !== 'undefined') {
          const itemsArray = this.line.split('\t')
          this.line = ''

          if (this.isFirstLine) {
            this.isFirstLine = false
            if (!this.shouldHeaderBeIncluded) continue
          }

          this.push(JSON.stringify(itemsArray))
        }
      }

      callback()
    } catch (e) {
      callback(e)
    }
  }

  _flush(callback) {
    try {
      callback(null, JSON.stringify(this.line.split('\t')))
    } catch (err) {
      callback(err)
    }
  }
}

module.exports = { TsvParser }
