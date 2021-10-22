import { Cache } from './index.js'
import { makeWorker } from '/functions/workerWrapper/makeWorker'

const cache = new Cache()

const addResources = (...args) => cache.addResources(...args)
const getResourcesGroup = (...args) => cache.getResourcesGroup(...args)
const getResources = (...args) => cache.getResources(...args)

makeWorker({
  addResources,
  getResourcesGroup,
  getResources,
})
