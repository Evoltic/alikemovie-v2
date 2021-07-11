// inside main thread

class WorkerManager {
  constructor() {
    this.workers = {}
    this.nextCallId = 0
  }

  sendMessage(worker, message, callBackOnResponse) {
    const callId = this.nextCallId
    this.nextCallId++

    worker.postMessage({ ...message, callId })

    const listener = ({ data = {} }) => {
      if (data.callId !== callId) return
      callBackOnResponse(data.error, data.result)
    }
    worker.addEventListener('message', listener)

    return () => worker.removeEventListener('message', listener)
  }

  sendMessagePromisified(worker, message) {
    // notice: all worker responses except the first will be ignored
    return new Promise((resolve, reject) => {
      const unsubscribe = this.sendMessage(worker, message, (err, res) => {
        unsubscribe()
        if (err) reject(err)
        else resolve(res)
      })
    })
  }

  getWorker(workerPath) {
    if (this.workers[workerPath]) return this.workers[workerPath]

    let worker = new Worker(workerPath)
    worker.terminate = () => {
      worker.terminate()
      delete this.workers[workerPath]
    }

    return (this.workers[workerPath] = worker)
  }

  async createWorkerContext(worker) {
    const contextId = await this.sendMessagePromisified(worker, {
      activityName: 'createContext'
    })

    const destroyContext = async () => {
      const contextsLeft = await this.sendMessagePromisified(worker, {
        activityName: 'destroyContext',
        contextId
      })
      if (contextsLeft === 0) worker.terminate()
    }

    return { contextId, destroyContext }
  }

  async getWorkerMethods(worker, contextId) {
    const workerMethodsList = await this.sendMessagePromisified(worker, {
      activityName: 'getMethodsList'
    })

    let methods = {}
    for (const methodName of workerMethodsList) {
      methods[methodName] = (...args) =>
        this.sendMessagePromisified(worker, {
          activityName: 'callWorkerMethod',
          methodName,
          contextId,
          args
        })
    }
    return methods
  }

  async subscribeToWorkerPublicState(worker, contextId, subscriber) {
    let listenerId

    const removeMessageListener = this.sendMessage(
      worker,
      {
        activityName: 'subscribeToPublicState',
        contextId
      },
      (err, { type, v } = {}) => {
        if (err) subscriber(err)
        if (type === 'state') subscriber(null, v)
        else if (type === 'listenerId') listenerId = v
      }
    )

    const unsubscribeFromWorkerPublicState = async () => {
      return this.sendMessagePromisified(worker, {
        activityName: 'unsubscribeFromPublicState',
        contextId,
        listenerId
      })
    }

    return async () => {
      removeMessageListener()
      return unsubscribeFromWorkerPublicState()
    }
  }

  async useWorker(workerPath) {
    const worker = await this.getWorker(workerPath)

    const { contextId, destroyContext } = await this.createWorkerContext(worker)

    const workerMethods = await this.getWorkerMethods(worker, contextId)

    const subscribeToWorkerPublicState = subscriber =>
      this.subscribeToWorkerPublicState(worker, contextId, subscriber)

    return {
      ...workerMethods,
      destroyContext,
      subscribeToWorkerPublicState
    }
  }
}

const workerManager = new WorkerManager()
const useWorker = (...args) => workerManager.useWorker(...args)

export { useWorker, WorkerManager }
