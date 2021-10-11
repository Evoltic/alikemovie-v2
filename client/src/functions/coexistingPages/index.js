class Page {
  constructor(id, status, component) {
    if (
      typeof id === 'undefined' ||
      typeof status === 'undefined' ||
      typeof component === 'undefined'
    ) {
      throw new Error('id, status and component are required')
    }
    this.id = id
    this.status = status
    this.component = component
  }
}

class CoexistingPages {
  constructor(options = {}) {
    const {
      initial,
      lifetimeMs = 0,
      minPagesLimit = 1,
      maxPagesLimit = Infinity,
      callback = () => {},
    } = options

    if (minPagesLimit < 1) {
      throw new Error('minPagesLimit must be greater than 1')
    }

    this.lifetimeMs = lifetimeMs
    this.maxPagesLimit = maxPagesLimit
    this.minPagesLimit = minPagesLimit
    this.callback = callback

    this.list = []

    this.nextId = 0
    this.timerId = null

    if (initial) this.addQuietly(initial, 'initial')
  }

  outdateEvery(shouldCallbackBeCalled = true) {
    this.list = this.list.map((page) => ({ ...page, status: 'outdated' }))
    if (shouldCallbackBeCalled) this.callback(this.list)
  }

  addQuietly(component, status = 'new') {
    this.outdateEvery(false)
    this.list.push(new Page(this.nextId, status, component))
    this.nextId += 1
  }

  check() {
    this.list = this.list.slice(-this.maxPagesLimit)
    this.callback(this.list)

    clearTimeout(this.timerId)
    this.timerId = setTimeout(() => {
      if (this.list.length >= this.maxPagesLimit) {
        this.list = this.list.slice(-this.minPagesLimit)
        this.callback(this.list)
      }
    }, this.lifetimeMs)
  }

  add(component) {
    this.addQuietly(component)
    this.callback(this.list)
    this.check()
  }
}

export { CoexistingPages }
