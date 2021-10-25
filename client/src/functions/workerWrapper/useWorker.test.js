import { expect } from 'chai'
import { WorkersPool, ExtendedWorker } from './useWorker'
const EventEmitter = require('events')

describe('/functions/workerWrapper/useWorker', async () => {
  context('WorkersPool', () => {
    it('ensures that getWorker returns the worker', () => {
      const createWorker = () => ({ someProp: 'someValue' })
      const workersPool = new WorkersPool({ createWorker })

      const worker = workersPool.checkOut('abc')
      expect(worker).to.be.eql({ someProp: 'someValue' })
    })

    it('ensures that worker termination is independent from other workers', () => {
      const createWorker = () => ({ terminate: () => {} })
      const workersPool = new WorkersPool({ createWorker })

      workersPool.checkOut('abc')
      workersPool.checkOut('xyz')

      workersPool.terminate('abc', () => {})

      expect(workersPool.workers['abc']).to.be.undefined
      expect(workersPool.workers['xyz']).to.not.undefined
    })
  })

  context('ExtendedWorker.sendMessage', () => {
    it('ensures that sendMessage sends passed messages', () => {
      let postedMessages = []

      const extendedWorker = new ExtendedWorker({
        postMessage: (message) => postedMessages.push(message),
        addEventListener: () => {},
        removeEventListener: () => {},
      })

      extendedWorker.sendMessage({ someValue: '1' })
      extendedWorker.sendMessage({ someValue: '2' })
      extendedWorker.sendMessage({ someValue: '3' })
      extendedWorker.sendMessage({ someValue: '4' })

      expect(postedMessages.map((msg) => msg.someValue)).to.be.eql([
        '1',
        '2',
        '3',
        '4',
      ])
    })

    it('ensures that sendMessage correctly removes listeners', () => {
      const emitter = new EventEmitter()

      const extendedWorker = new ExtendedWorker({
        postMessage: () => {},
        addEventListener: (...args) => emitter.addListener(...args),
        removeEventListener: (...args) => emitter.removeListener(...args),
      })

      extendedWorker.sendMessage({})()
      extendedWorker.sendMessage({})()
      extendedWorker.sendMessage({})()
      extendedWorker.sendMessage({})

      const events = emitter.eventNames()
      const listenersCount = events.reduce(
        (sum, eventName) => sum + emitter.listenerCount(eventName),
        0
      )

      expect(listenersCount).to.be.eql(1)
    })

    it('ensures that the callback in sendMessage works correctly despite an order of sending back messages', () => {
      const emitter = new EventEmitter()

      let sentMessages = []

      const extendedWorker = new ExtendedWorker({
        postMessage: (message) => sentMessages.push(message),
        addEventListener: (...args) => emitter.addListener(...args),
        removeEventListener: (...args) => emitter.removeListener(...args),
      })

      let lastResponse = undefined
      const callbackOnResponse = (error, result) =>
        (lastResponse = { error, result })

      extendedWorker.sendMessage({ v: 'a' }, callbackOnResponse)
      extendedWorker.sendMessage({ v: 'b' }, callbackOnResponse)
      extendedWorker.sendMessage({ v: 'c' }, callbackOnResponse)
      extendedWorker.sendMessage({ v: 'd' }, callbackOnResponse)

      const emit = (callId, error, result) =>
        emitter.emit('message', {
          data: {
            callId,
            error,
            result,
          },
        })

      const someError = new Error('some error')
      emit(sentMessages[1].callId, someError, undefined)
      expect(lastResponse).to.be.eql({ error: someError, result: undefined })

      emit(sentMessages[0].callId, undefined, sentMessages[0].v)
      expect(lastResponse).to.be.eql({ result: 'a', error: undefined })

      emit(sentMessages[3].callId, undefined, sentMessages[3].v)
      expect(lastResponse).to.be.eql({ result: 'd', error: undefined })

      emit(sentMessages[2].callId, undefined, sentMessages[2].v)
      expect(lastResponse).to.be.eql({ result: 'c', error: undefined })
    })
  })

  context('ExtendedWorker.sendMessagePromisified', async () => {
    it('ensures that sendMessagePromisified: sends passed messages, removes listeners, returns correct response', async () => {
      const emitter = new EventEmitter()

      let sentMessages = []

      const extendedWorker = new ExtendedWorker({
        postMessage: (message) => sentMessages.push(message),
        addEventListener: (...args) => emitter.addListener(...args),
        removeEventListener: (...args) => emitter.removeListener(...args),
      })

      const promise1 = extendedWorker.sendMessagePromisified({ v: 'a' })
      const promise2 = extendedWorker.sendMessagePromisified({ v: 'b' })
      const promise3 = extendedWorker.sendMessagePromisified({ v: 'c' })
      const promise4 = extendedWorker.sendMessagePromisified({ v: 'd' })

      expect(sentMessages.map((msg) => msg.v)).to.be.eql(['a', 'b', 'c', 'd'])

      const emit = (callId, error, result) =>
        emitter.emit('message', {
          data: {
            callId,
            result,
            error,
          },
        })
      emit(sentMessages[0].callId, undefined, sentMessages[0].v)
      emit(sentMessages[3].callId, undefined, sentMessages[3].v)
      emit(
        sentMessages[1].callId,
        new Error('unexpected example error'),
        undefined
      )
      emit(sentMessages[2].callId, undefined, sentMessages[2].v)

      expect(await promise1).to.be.eql('a')
      expect(await promise2.catch((err) => err.message)).to.be.eql(
        'unexpected example error'
      )
      expect(await promise3).to.be.eql('c')
      expect(await promise4).to.be.eql('d')

      const listenersCount = emitter
        .eventNames()
        .reduce((sum, eventName) => sum + emitter.listenerCount(eventName), 0)
      expect(listenersCount).to.be.eql(0)
    })
  })
})
