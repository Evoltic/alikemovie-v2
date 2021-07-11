// TODO: .addResources method expects that some arguments are a function type,
//  so, the method couldn't be used with the current web worker implementation.
//  either the method must be rewritten without expecting a function type,
//  or the worker implementation must be changed, so it could allow a function
//  type be shared across workers

class Cache {
  constructor(options = {}) {
    const {
      maximumResourcesLimit = 1000,
      minimumResourcesLimit = 800
    } = options

    this.resources = {}
    this.groups = new Map()

    this.maximumResourcesLimit = maximumResourcesLimit
    this.minimumResourcesLimit = minimumResourcesLimit
    this.resourcesKeysInUsageOrder = new Set()
  }

  upResource(resourceKey) {
    if (this.resourcesKeysInUsageOrder.has(resourceKey)) {
      this.resourcesKeysInUsageOrder.delete(resourceKey)
    }
    this.resourcesKeysInUsageOrder.add(resourceKey)
  }

  removeResource(resourceKey) {
    delete this.resources[resourceKey]

    for (const groupKey of this.groups) {
      if (this.groups[groupKey].has(resourceKey)) delete this.groups[groupKey]
    }

    this.resourcesKeysInUsageOrder.delete(resourceKey)
  }

  clearLessUsedResources() {
    // description of the method:
    // if the upper limit is reached, clear to the lower limit.

    const length = this.resourcesKeysInUsageOrder.size
    if (length < this.maximumResourcesLimit) return
    const excess = length - this.minimumResourcesLimit

    let i = 0
    const copy = new Set(this.resourcesKeysInUsageOrder)
    for (const resourceKey of copy) {
      if (i >= excess) return
      i++

      this.removeResource(resourceKey)
    }
  }

  getResources(resourcesKeys, shouldBeArray = true) {
    let resources = shouldBeArray ? [] : {}

    for (const key of resourcesKeys) {
      const resource = this.resources[key]
      if (shouldBeArray) resources.push(resource)
      else resources[key] = resource

      this.upResource(key)
    }

    this.clearLessUsedResources()

    return resources
  }

  getResourcesGroup(groupKey, shouldBeArray) {
    if (!this.groups.has(groupKey)) return undefined
    return this.getResources(this.groups.get(groupKey), shouldBeArray)
  }

  addResources(resources, uniteSameResource, groupKey, resolveResourceKey) {
    for (const index in resources) {
      const resource = resources[index]
      const key = resolveResourceKey ? resolveResourceKey(resource) : index
      this.resources[key] = uniteSameResource(resource, this.resources[key])

      this.upResource(key)

      if (!groupKey) continue
      if (this.groups.has(groupKey)) {
        this.groups.get(groupKey).add(key)
      } else {
        this.groups.set(groupKey, new Set([key]))
      }
    }
  }
}

export { Cache }
