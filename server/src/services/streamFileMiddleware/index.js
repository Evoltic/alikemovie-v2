const fs = require('fs')
const { Transform, finished } = require('stream')
const { TemporaryDirectory } = require('../../functions/temporaryDirectory')

class WriteStreamTransform extends Transform {
  constructor(options) {
    super(options)
    this.chunksSeparator = options.chunksSeparator
  }

  _transform(chunk, encoding, callback) {
    this.push(chunk.toString() + this.chunksSeparator)
    callback()
  }
}

class ReadStreamTransform extends Transform {
  constructor(options) {
    super(options)
    this.chunksSeparator = options.chunksSeparator
    this.remainChunk = ''
  }

  _transform(chunk, encoding, callback) {
    const receivedChunks = chunk.toString().split(this.chunksSeparator)

    const firstChunk = receivedChunks[0]
    const middleChunks = receivedChunks.slice(1, -1)
    const lastChunk = receivedChunks.slice(-1)[0]

    const chunks = [this.remainChunk + firstChunk, ...middleChunks]
    this.remainChunk = lastChunk || ''

    for (const chunk of chunks) {
      this.push(chunk)
    }

    callback()
  }

  _flush(callback) {
    callback(null)
  }
}

class StreamFileMiddleware {
  constructor(options = {}) {
    const {
      temporaryDirectoryPath = __dirname + '/tmp',
      filesystem = fs,
      chunksSeparator = '\n',
      handleError = (e) => {
        throw e
      },
    } = options

    this.fs = filesystem
    this.chunksSeparator = chunksSeparator
    this.handleError = handleError

    this.temporaryDirectory = new TemporaryDirectory(temporaryDirectoryPath, {
      filesystem,
    })
    this.ongoingProcesses = new Set()
  }

  async pipeStreams(readStream, transformStream, writeStream) {
    const handleError = (err) => {
      readStream.destroy(err)
      transformStream.destroy(err)
      writeStream.destroy(err)
      this.handleError(err)
    }

    const stream = readStream
      .on('error', handleError)
      .pipe(transformStream)
      .on('error', handleError)
      .pipe(writeStream)
      .on('error', handleError)

    return new Promise((resolve, reject) => {
      finished(stream, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  async writeToFile(path, readStream) {
    this.fs.writeFileSync(path, '')

    const writeStream = this.fs.createWriteStream(path)
    const transformStream = new WriteStreamTransform({
      chunksSeparator: this.chunksSeparator,
    })

    return this.pipeStreams(readStream, transformStream, writeStream)
  }

  async readFromFile(path, writeStream) {
    const readStream = fs.createReadStream(path)
    const transformStream = new ReadStreamTransform({
      chunksSeparator: this.chunksSeparator,
    })

    return this.pipeStreams(readStream, transformStream, writeStream)
  }

  async deleteFile(path) {
    return new Promise((resolve, reject) => {
      this.fs.unlink(path, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  async process(readStream, writeStream, filename) {
    if (typeof filename === 'undefined') {
      throw new Error(`filename argument must be defined`)
    }

    if (this.ongoingProcesses.has(filename)) {
      throw new Error(`the process "${filename}" is already in progress`)
    }
    this.ongoingProcesses.add(filename)

    const path = `${this.temporaryDirectory.path}/${filename}`

    try {
      await this.writeToFile(path, readStream)
      await this.readFromFile(path, writeStream)
      await this.deleteFile(path)
    } finally {
      this.ongoingProcesses.delete(filename)
    }
  }
}

module.exports = { StreamFileMiddleware }
