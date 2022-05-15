const { Writable } = require('stream')
const { ImdbDatasets } = require('../imdbDatasets')
const { StreamFileMiddleware } = require('../streamFileMiddleware')

class MoviesFiller {
  constructor(savers, hooks = {}, optional = {}) {
    this.imdbDatasets = new ImdbDatasets()

    this.savers = savers
    const { callBeforeSaveOperations, callAfterSaveOperations } = hooks
    this.hooks = { callBeforeSaveOperations, callAfterSaveOperations }

    const {
      handleError = (e) => {
        throw e
      },
      updateProgress = () => {},
    } = optional
    this.handleError = handleError
    this.updateProgress = updateProgress

    this.streamFileMiddleware = new StreamFileMiddleware({
      temporaryDirectoryPath: __dirname + '/tmp',
      handleError: (e) => handleError(e),
    })
  }

  async downloadAndSave(datasetKey) {
    const handleError = this.handleError

    const saver = this.savers[datasetKey]
    const readableStream = await this.imdbDatasets.download(datasetKey)

    let context = {}

    if (this.hooks.callBeforeSaveOperations) {
      await this.hooks.callBeforeSaveOperations.call(context, datasetKey)
    }

    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        const json = chunk.toString()
        const row = JSON.parse(json).map((v) => (v === '\\N' ? undefined : v))

        saver
          .call(context, row)
          .catch((e) => handleError(e))
          .finally(() => callback())
      },
    })

    try {
      await this.streamFileMiddleware.process(
        readableStream,
        writableStream,
        datasetKey
      )
    } finally {
      await this.hooks.callAfterSaveOperations.call(context, datasetKey)
    }
  }

  async start() {
    const checkDownloadSaveNotify = (key) => {
      if (!this.savers[key]) return

      this.updateProgress(key, 'start')
      const startTime = Date.now()

      return this.downloadAndSave(key)
        .catch((e) => this.handleError(e))
        .finally(() =>
          this.updateProgress(key, `done. took ${Date.now() - startTime} ms`)
        )
    }

    await checkDownloadSaveNotify('title.basics')
    await checkDownloadSaveNotify('name.basics')
    await checkDownloadSaveNotify('title.principals')
    await checkDownloadSaveNotify('title.akas')
  }
}

module.exports = { MoviesFiller }
