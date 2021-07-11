// outside main thread

class Context {
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

function makeWorker(methods) {
  let contexts = {}
  let contextId = 0

  const handleMessage = (postMsg, data) => {
    const { activityName, callId } = data

    switch (activityName) {
      case 'getMethodsList':
        postMsg(Object.keys(methods))
        break
      case 'createContext':
        contexts[contextId] = new Context()

        postMsg(contextId)
        contextId++
        break
      case 'destroyContext':
        if (typeof data.contextId === 'undefined') return

        delete contexts[data.contextId]
        postMsg(Object.keys(contexts).length)
        break
      case 'callWorkerMethod':
        if (typeof data.methodName === 'undefined') return
        if (typeof data.contextId === 'undefined') return

        postMsg(
          methods[data.methodName].apply(contexts[data.contextId], data.args)
        )
        break
      case 'subscribeToPublicState':
        if (typeof contexts[data.contextId] === 'undefined') return

        const listener = (state) => {
          postMsg({ type: 'state', v: state }, callId)
        }

        const listenerId = contexts[data.contextId].addPublicStateListener(listener)
        postMsg({ type: 'listenerId', v: listenerId })
        break
      case 'unsubscribeFromPublicState':
        if (typeof data.contextId === 'undefined') return
        if (typeof contexts[contextId] === 'undefined') return
        if (typeof data.listenerId === 'undefined') return

        postMsg(contexts[contextId].removePublicStateListener(data.listenerId))
        break
    }
  }

  self.onmessage = ({ data = {} }) => {
    const postMsg = (result, callId = data.callId) => {
      const isResultPromise = result ? !!result.then : false

      if (!isResultPromise) postMessage({ callId, result })
      else
        result
          .then(r => postMessage({ callId, result: r }))
          .catch(error => postMessage({ callId: data.callId, error }))
    }

    try {
      handleMessage(postMsg, data)
    } catch (error) {
      postMessage({ callId: data.callId, error })
    }
  }
}

export { makeWorker }
