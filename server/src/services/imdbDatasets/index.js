const zlib = require('zlib')
const fetch = require('node-fetch')
const { TsvParser } = require('../../functions/tsvParser')
const { logger } = require('../../functions/logger')

class ImdbDatasets {
  constructor() {
    this.baseUrl = `https://datasets.imdbws.com/`
    this.datasets = {
      'name.basics': 'name.basics.tsv.gz',
      'title.akas': 'title.akas.tsv.gz',
      'title.basics': 'title.basics.tsv.gz',
      'title.crew': 'title.crew.tsv.gz',
      'title.episode': 'title.episode.tsv.gz',
      'title.principals': 'title.principals.tsv.gz',
      'title.ratings': 'title.ratings.tsv.gz'
    }
  }

  async download(datasetKey) {
    const dataset = this.datasets[datasetKey]
    if (!dataset) throw new Error(`the dataset "${datasetKey}" doesn't exist`)

    const url = this.baseUrl + dataset
    const response = await fetch(url)

    if (response.status !== 200) {
      throw new Error(`can't fetch "${url}", status code: ${response.status}`)
    }

    const readableStream = response.body
    const decompressionStream = zlib.createGunzip()
    const parserStream = new TsvParser({ shouldHeaderBeIncluded: false })

    const handleError = (err) => {
      logger.error(err)
      readableStream.destroy()
      decompressionStream.destroy()
      parserStream.destroy()
    }

    return readableStream
      .on('error', handleError)
      .pipe(decompressionStream)
      .on('error', handleError)
      .pipe(parserStream)
      .on('error', handleError)
  }
}

module.exports = { ImdbDatasets }
