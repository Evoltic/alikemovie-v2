import { expect } from 'chai'
import { AsyncQueue, AutoWorker } from './autoWorker'

describe('/functions/workerWrapper/autoWorker', async () => {
  context('AsyncQueue', async () => {
    it('ensures that .executeAll correctly executes all tasks', async () => {
      const asyncQueue = new AsyncQueue()

      let result = []

      const goodAsyncFunc = (value) =>
        new Promise((resolve) => setTimeout(() => resolve(value), 0))
      const badAsyncFunc = (value) =>
        new Promise((resolve, reject) => setTimeout(() => reject(value), 0))

      asyncQueue.add({
        func: () => goodAsyncFunc('a'),
        reject: (v) => result.push(v),
        resolve: (v) => result.push(v),
      })
      asyncQueue.add({
        func: () => badAsyncFunc('b'),
        reject: (v) => result.push(v),
        resolve: (v) => result.push(v),
      })
      asyncQueue.add({
        func: () => goodAsyncFunc('c'),
        reject: (v) => result.push(v),
        resolve: (v) => result.push(v),
      })

      await asyncQueue.executeAll()

      expect(result).to.be.eql(['a', 'b', 'c'])
    })

    it('ensures that .rejectAll rejects all tasks', async () => {
      const asyncQueue = new AsyncQueue()

      let result = []

      const goodAsyncFunc = (value) =>
        new Promise((resolve) => setTimeout(() => resolve(value), 0))
      const badAsyncFunc = (value) =>
        new Promise((resolve, reject) => setTimeout(() => reject(value), 0))

      asyncQueue.add({
        func: () => goodAsyncFunc('a'),
        reject: (v) => result.push(v),
        resolve: (v) => result.push(v),
      })
      asyncQueue.add({
        func: () => badAsyncFunc('b'),
        reject: (v) => result.push(v),
        resolve: (v) => result.push(v),
      })
      asyncQueue.add({
        func: () => goodAsyncFunc('c'),
        reject: (v) => result.push(v),
        resolve: (v) => result.push(v),
      })

      const reason = 'force reject'
      await asyncQueue.rejectAll(reason)

      expect(result).to.be.eql(['force reject', 'force reject', 'force reject'])
    })
  })

  context('AutoWorker', async () => {
    it('ensures that tasks are scheduled but not resolved/rejected before the .create call', async () => {
      let result = []

      const useWorker = () => ({
        someMethod1: async (...args) => result.push({ args }),
        someMethod2: async (...args) => result.push({ args }),
        someMethod3: async (...args) => result.push({ args }),
      })
      const autoWorker = new AutoWorker('/example', { useWorker })

      const promise1 = autoWorker.do('someMethod1', 'a', 'b', 'c')
      const promise2 = autoWorker.do('someMethod2', 'x', 'y', 'z')
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(result).to.be.eql([])

      await autoWorker.create()
      expect(result).to.be.eql([
        { args: ['a', 'b', 'c'] },
        { args: ['x', 'y', 'z'] },
      ])

      await autoWorker.do('someMethod3', '1', '2', '3')
      expect(result).to.be.eql([
        { args: ['a', 'b', 'c'] },
        { args: ['x', 'y', 'z'] },
        { args: ['1', '2', '3'] },
      ])
    })

    it('ensures that .destroy rejects promises in the queue', async () => {
      let result = []

      const useWorker = () => ({
        someMethod1: async (...args) => result.push({ args }),
        someMethod2: async (...args) => result.push({ args }),
      })
      const autoWorker = new AutoWorker('/example', { useWorker })

      const promise1 = autoWorker.do('someMethod1', 'a', 'b', 'c')
      const promise2 = autoWorker.do('someMethod2', 'x', 'y', 'z')

      await autoWorker.destroy('force reject')
      await promise1.catch((err) => result.push(err))
      await promise2.catch((err) => result.push(err))

      expect(result).to.be.eql(['force reject', 'force reject'])
    })

    it('ensures that a worker .destroyContext is called on autoWorker.destroy', async () => {
      let isDestroyed = false

      const useWorker = () => ({
        destroyContext: async () => (isDestroyed = true),
      })
      const autoWorker = new AutoWorker('/example', { useWorker })

      await autoWorker.create()
      await autoWorker.destroy()

      expect(isDestroyed).to.be.eql(true)
    })

    it('ensures that calling .create after .destroy throws an error', async () => {
      const useWorker = () => ({
        destroyContext: async () => {},
      })
      const autoWorker = new AutoWorker('/example', { useWorker })

      await autoWorker.destroy()

      expect(await autoWorker.create().catch((err) => err)).to.be.an.instanceof(
        Error
      )
    })
  })
})
