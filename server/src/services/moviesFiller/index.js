const { Writable, finished } = require('stream')
const { ImdbDatasets } = require('../imdbDatasets')
const { logger } = require('../../functions/logger')

class MoviesFiller {
  constructor(savers, hooks = {}) {
    this.imdbDatasets = new ImdbDatasets()

    this.savers = savers
    const { callBeforeSaveOperations, callAfterSaveOperations } = hooks
    this.hooks = { callBeforeSaveOperations, callAfterSaveOperations }
  }

  async downloadAndSave(datasetKey) {
    const saver = this.savers[datasetKey]
    const readableStream = await this.imdbDatasets.download(datasetKey)

    let context = {}

    if (this.hooks.callBeforeSaveOperations) {
      await this.hooks.callBeforeSaveOperations.call(context)
    }

    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        const json = chunk.toString()
        const row = JSON.parse(json).map(v => (v === '\\N' ? undefined : v))

        saver
          .call(context, row)
          .catch(e => logger.error(e))
          .finally(() => callback())
      }
    })

    try {
      await new Promise((resolve, reject) => {
        finished(readableStream.pipe(writableStream), err => {
          err ? reject(err) : resolve()
        })
      })
    } finally {
      await this.hooks.callAfterSaveOperations.call(context)
    }
  }

  async start() {
    const s = this.savers
    try {
      s['title.basics'] && (await this.downloadAndSave('title.basics'))
      s['name.basics'] && (await this.downloadAndSave('name.basics'))
      s['title.principals'] && (await this.downloadAndSave('title.principals'))
    } catch (e) {
      logger.error(e)
    }
  }
}

module.exports = { MoviesFiller }
