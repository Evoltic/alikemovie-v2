// inside main thread

class ExtendedWorker {
  constructor(getWorker, terminateWorker) {
    this.nextCallId = 0

    this.worker = getWorker()
    this.terminateWorker = terminateWorker || (() => this.worker.terminate())
  }

  sendMessage(message, callBackOnResponse) {
    const callId = this.nextCallId
    this.nextCallId++

    this.worker.postMessage({ ...message, callId })

    const listener = ({ data = {} }) => {
      if (data.callId !== callId) return
      callBackOnResponse(data.error, data.result)
    }
    this.worker.addEventListener('message', listener)

    return () => this.worker.removeEventListener('message', listener)
  }

  sendMessagePromisified(message) {
    // notice: all worker responses except the first will be ignored
    return new Promise((resolve, reject) => {
      const unsubscribe = this.sendMessage(message, (err, res) => {
        unsubscribe()
        if (err) reject(err)
        else resolve(res)
      })
    })
  }

  async createWorkerContext()  {
    const contextId = await this.sendMessagePromisified({
      activityName: 'createContext',
    })

    const destroyContext = async () => {
      const contextsLeft = await this.sendMessagePromisified({
        activityName: 'destroyContext',
        contextId,
      })
      if (contextsLeft === 0) this.terminateWorker()
    }

    return { contextId, destroyContext }
  }

  async getWorkerMethods(contextId) {
    const workerMethodsList = await this.sendMessagePromisified({
      activityName: 'getMethodsList',
    })

    let methods = {}
    for (const methodName of workerMethodsList) {
      methods[methodName] = (...args) =>
        this.sendMessagePromisified({
          activityName: 'callWorkerMethod',
          methodName,
          contextId,
          args,
        })
    }
    return methods
  }

  async subscribeToWorkerPublicState(contextId, subscriber) {
    let listenerId

    const removeMessageListener = this.sendMessage(
      {
        activityName: 'subscribeToPublicState',
        contextId,
      },
      (err, { type, v } = {}) => {
        if (err) subscriber(err)
        if (type === 'state') subscriber(null, v)
        else if (type === 'listenerId') listenerId = v
      }
    )

    const unsubscribeFromWorkerPublicState = async () => {
      return this.sendMessagePromisified({
        activityName: 'unsubscribeFromPublicState',
        contextId,
        listenerId,
      })
    }

    return async () => {
      removeMessageListener()
      return unsubscribeFromWorkerPublicState()
    }
  }

  async useWorker() {
    const { contextId, destroyContext } = await this.createWorkerContext()

    const workerMethods = await this.getWorkerMethods(contextId)

    const subscribeToWorkerPublicState = (subscriber) =>
      this.subscribeToWorkerPublicState(contextId, subscriber)

    return {
      ...workerMethods,
      destroyContext,
      subscribeToWorkerPublicState,
    }
  }
}

class WorkersPool {
  constructor() {
    this.workers = {}
  }

  manage(workerPath) {
    return {
      getWorker: () => {
        if (this.workers[workerPath]) {
          this.workers[workerPath].users++
          return this.workers[workerPath].itself
        }

        this.workers[workerPath] = {
          itself: new Worker(workerPath),
          users: 1,
        }
        return this.workers[workerPath].itself
      },
      terminateWorker: () => {
        this.workers[workerPath].users--
        if (this.workers[workerPath].users === 0) {
          this.workers[workerPath].itself.terminate()
          delete this.workers[workerPath]
        }
      },
    }
  }
}
const workersPool = new WorkersPool()

export const useWorker = async (workerPath) => {
  const { getWorker, terminateWorker } = workersPool.manage(workerPath)
  return new ExtendedWorker(getWorker, terminateWorker).useWorker()
}
