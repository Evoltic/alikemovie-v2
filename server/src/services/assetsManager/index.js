const { TemporaryDirectory } = require('../../functions/temporaryDirectory')

class AssetsManager {
  constructor(optional = {}) {
    const {
      groupName = 'common',
      fs = require('fs'),
      availableBytes = Infinity,
      handleLimitError,
    } = optional

    this.fs = fs
    this.tmpPath = __dirname + `/tmp`
    this.basePath = this.tmpPath + `/${groupName}-`

    this.availableBytes = availableBytes
    this.handleLimitError = handleLimitError

    new TemporaryDirectory(this.tmpPath, { filesystem: this.fs })
  }

  async saveAsset(fileName, data) {
    const path = this.basePath + `${fileName}`
    const dataSize = data.length

    if (this.availableBytes - dataSize < 0) {
      const e = new Error(
        `can't save the asset: exceed the available bytes limit`
      )

      if (!this.handleLimitError) throw e

      const shouldAssetBeSaved = this.handleLimitError(e)
      if (!shouldAssetBeSaved) return
    }

    this.availableBytes -= dataSize
    return new Promise((resolve, reject) => {
      this.fs.writeFile(path, data, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  async findAsset(fileName, cacheTimeMs) {
    const path = this.basePath + `${fileName}`

    const stats = await new Promise((resolve) => {
      this.fs.stat(path, (err, stats) => {
        err ? resolve(null) : resolve(stats)
      })
    })
    if (!stats) return null

    if (Date.now() - new Date(stats.mtime).getTime() >= cacheTimeMs) {
      return null
    }

    return new Promise((resolve, reject) => {
      this.fs.readFile(path, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  async callWithCacheLookup(
    resolveData,
    fileName,
    cacheTimeMs = Infinity,
    modifiers = {}
  ) {
    const {
      encode = async (data) => data,
      decode = async (buffer) => buffer.toString(),
    } = modifiers

    let result

    result = await this.findAsset(fileName, cacheTimeMs)
    if (result) return decode(result)

    result = await resolveData()
    await this.saveAsset(fileName, await encode(result))

    return result
  }
}

module.exports = { AssetsManager }
