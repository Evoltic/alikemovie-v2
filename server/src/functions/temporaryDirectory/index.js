const fs = require('fs')

class TemporaryDirectory {
  constructor(directoryPath, { filesystem } = {}) {
    this.path = directoryPath
    this.fs = filesystem || fs
    this.ensureTmpDirectoryIsReady()
  }

  removeTmpDirectory() {
    return fs.rmdirSync(this.path, { recursive: true, force: true })
  }

  checkIsTmpDirectoryExists() {
    try {
      this.fs.statSync(this.path)
      return true
    } catch (e) {
      if (e.code === 'ENOENT') return false
      throw e
    }
  }

  createTmpDirectory() {
    return this.fs.mkdirSync(this.path)
  }

  ensureTmpDirectoryIsReady() {
    const isTempDirectoryExists = this.checkIsTmpDirectoryExists()
    if (isTempDirectoryExists) this.removeTmpDirectory()

    this.createTmpDirectory()
  }
}

module.exports = { TemporaryDirectory }
