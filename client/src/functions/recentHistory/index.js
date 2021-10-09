class RecentHistory {
  constructor(initialHistory = [], options = {}) {
    const { maxLength = Infinity } = options

    this.history = initialHistory
    this.isMovingBackwards = false
    this.backwardsCursor = null
    this.maxLength = maxLength
  }

  add(item, callback) {
    if (item === this.history.slice(-1)[0]) return false

    if (this.backwardsCursor === null) {
      this.isMovingBackwards = item === this.history[this.history.length - 2]
      if (this.isMovingBackwards) this.backwardsCursor = this.history.length - 2
    } else {
      this.isMovingBackwards = item === this.history[this.backwardsCursor - 1]
      if (this.isMovingBackwards) this.backwardsCursor -= 1
      else this.backwardsCursor = null
    }

    if (this.history.length === this.maxLength) {
      this.history = this.history.slice(-this.maxLength + 1)
      if (this.backwardsCursor === 0) this.backwardsCursor = null
    }

    this.history.push(item)
    if (callback) {
      callback({
        history: this.history,
        isMovingBackwards: this.isMovingBackwards,
      })
    }
    return true
  }
}

export { RecentHistory }
