// outside main thread
import { lowercaseFirstLetter } from '/functions/lowercaseFirstLetter'

class Contexts {
  constructor() {
    this.contexts = {}
    this.nextContextId = 0
  }

  createContext() {
    this.nextContextId++
    const contextId = this.nextContextId
    this.contexts[contextId] = {}
    return contextId
  }

  destroyContext(contextId) {
    delete this.contexts[contextId]
    return Object.keys(this.contexts).length
  }

  extendContext(contextId, extension) {
    this.contexts[contextId] = { ...this.contexts[contextId], ...extension }
  }
}

class State {
  constructor() {
    this.publicState = {}

    this.listeners = {}
    this.listenerId = 0
  }

  setPublicState(getNewState) {
    const previousState = this.publicState
    this.publicState = getNewState(previousState)

    for (const listenerId in this.listeners) {
      const listener = this.listeners[listenerId]
      listener(this.publicState)
    }
  }

  addPublicStateListener(listener) {
    this.listenerId++

    this.listeners[this.listenerId] = listener
    return this.listenerId
  }

  removePublicStateListener(listenerId) {
    return delete this.listeners[listenerId]
  }
}

const handlers = {
  createContext: ({}, { classes }) => {
    const id = classes.contexts.createContext()
    classes.contexts.extendContext(id, { state: new classes.State() })
    return id
  },
  destroyContext: ({ contextId }, { classes }) => {
    return classes.contexts.destroyContext(contextId)
  },
  subscribeToPublicState: ({ contextId }, { classes, callback }) => {
    const context = classes.contexts[contextId]
    const listener = (state) => callback({ type: 'state', v: state })
    const listenerId = context.state.addPublicStateListener(listener)
    return { type: 'listenerId', v: listenerId }
  },
  unsubscribeFromWorkerPublicState: (data, { classes }) => {
    const { contextId, listenerId } = data
    const context = classes.contexts[contextId]
    return context.state.removePublicStateListener(listenerId)
  },
  getMethodsList: ({}, { methods }) => Object.keys(methods ? methods : {}),
  callWorkerMethod: ({ methodName, contextId, args }, { classes, methods }) => {
    const context = classes.contexts[contextId]
    return methods[methodName].apply(context, args)
  },
}

function makeWorker(methods) {
  const classes = {
    contexts: new Contexts(),
    State: State,
  }

  self.onmessage = ({ data = {} }) => {
    const { callId, activityName } = data

    const answer = (result) => {
      const isResultPromise = result ? !!result.then : false

      if (!isResultPromise) postMessage({ callId, result })
      else
        result
          .then((r) => postMessage({ callId, result: r }))
          .catch((error) => postMessage({ callId, error }))
    }

    try {
      answer(
        handlers[activityName](data, { classes, methods, callback: answer })
      )
    } catch (error) {
      postMessage({ callId, error })
    }
  }
}

export { makeWorker }
