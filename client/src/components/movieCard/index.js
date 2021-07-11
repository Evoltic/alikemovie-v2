import React from 'react'
import { Markup } from './markup'
import { useWorker } from '/functions/workerWrapper/useWorker'

const setup = async () => {
  // for example purpose

  if (typeof document === 'undefined') return

  const {
    performServerMethod,
    performServerMethodAndWriteToState,

    subscribeToWorkerPublicState,
    destroyContext: destroyServerApiContext
  } = await useWorker('/functions/serverApi/index.worker.js')

  performServerMethod('searchMovies', { query: 'avengers' })
    .then(res => console.log('searchMovies res', res))
    .catch(err => console.log('searchMovies err', err))

  performServerMethod('getSimilarMovies', { movieId: '694999' })
    .then(res => console.log('getSimilarMovies res', res))
    .catch(err => console.log('getSimilarMovies err', err))

  performServerMethodAndWriteToState('getMoviesExample', {})
    .then(res => console.log('getMoviesExample finished, res', res))
    .catch(err => console.log('getMoviesExample finished, err', err))

  subscribeToWorkerPublicState((err, state) =>
    console.log(
      'public state of "/functions/serverApi/index.worker.js" worker of "src/components/movieCard" context',
      state
    )
  )

  const {
    calculate,

    destroyContext: destroyComponentWorkerContext
  } = await useWorker('/components/movieCard/index.worker.js')

  calculate('2', 3).then(res => console.log(res, res === '23'))

  return () => {
    destroyServerApiContext()
    destroyComponentWorkerContext()
  }
}

function MovieCard() {
  setup()

  return <Markup />
}

export { MovieCard }
