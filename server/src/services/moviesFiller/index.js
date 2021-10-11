const { Writable, finished } = require('stream')
const { ImdbDatasets } = require('../imdbDatasets')

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
  }

  async downloadAndSave(datasetKey) {
    const handleError = this.handleError

    const saver = this.savers[datasetKey]
    const readableStream = await this.imdbDatasets.download(datasetKey)

    let context = {}

    if (this.hooks.callBeforeSaveOperations) {
      await this.hooks.callBeforeSaveOperations.call(context)
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
      await new Promise((resolve, reject) => {
        finished(readableStream.pipe(writableStream), (err) => {
          err ? reject(err) : resolve()
        })
      })
    } finally {
      await this.hooks.callAfterSaveOperations.call(context)
    }
  }

  async start() {
    const checkDownloadSaveNotify = (key) => {
      if (!this.savers[key]) return
      this.updateProgress(key, 'start')
      return this.downloadAndSave(key)
        .catch((e) => this.handleError(e))
        .finally(() => this.updateProgress(key, 'done'))
    }

    await checkDownloadSaveNotify('title.basics')
    checkDownloadSaveNotify('title.akas')
    await checkDownloadSaveNotify('name.basics')
    await checkDownloadSaveNotify('title.principals')
  }
}

module.exports = { MoviesFiller }
