import { makeWorker } from 'extended-worker/makeWorker'

async function getSimilarMovies(movieId) {
  // TODO: resolve an issue with overwriting movie score

  const cacheGroupName = `similar movies for ${movieId}`

  const resultFromCache = await this.subWorkers.callMethod(
    '/functions/cache/index.worker.js',
    'getResourcesGroup',
    cacheGroupName,
    true
  )
  if (resultFromCache) return { items: resultFromCache }

  const result = await this.subWorkers
    .callMethod(
      '/functions/serverApi/index.worker.js',
      'performServerMethod',
      `getSimilarMovies`,
      { movieId }
    )
    .then((items) => (items.length === 0 ? { isNotFound: true } : { items }))
    .catch((err) => {
      console.log(err)
      return { isUnknownError: true }
    })

  if (result.items) {
    await this.subWorkers.callMethod(
      '/functions/cache/index.worker.js',
      'addResources',
      result.items,
      { groupKey: cacheGroupName, fieldWithResourceKey: 'id' }
    )
  }

  return result
}

makeWorker({ getSimilarMovies })
