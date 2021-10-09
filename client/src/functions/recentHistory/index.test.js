import { expect } from 'chai'
import { RecentHistory } from './index'

describe('/functions/recentHistory', function () {
  context('RecentHistory', () => {
    it('ensures that the class interprets the first argument as initial history', () => {
      const recentHistory = new RecentHistory([1])
      expect(recentHistory.history).to.be.eql([1])
    })

    it('ensures that .add actually ads to the history', () => {
      const recentHistory = new RecentHistory()
      recentHistory.add(2)
      expect(recentHistory.history).to.be.eql([2])
    })

    it('ensures that the same item as the last in the history ignored', () => {
      const recentHistory = new RecentHistory([1])
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(1)
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(1)
      recentHistory.add(5)
      expect(recentHistory.history).to.be.eql([1, 2, 1, 2, 1, 5])
    })

    it('ensures that if the item is added .add returns true', () => {
      const recentHistory = new RecentHistory([1, 2, 3])
      const isAdded = recentHistory.add(4)
      expect(isAdded).to.be.eql(true)
    })

    it('ensures that if the item is ignored .add returns false', () => {
      const recentHistory = new RecentHistory([1, 2, 3])
      const isAdded = recentHistory.add(3)
      expect(isAdded).to.be.eql(false)
    })

    it('ensures that isMovingBackwards works correct: test 1', () => {
      const recentHistory = new RecentHistory([])
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(3)
      expect(recentHistory.isMovingBackwards).to.be.eql(false)

      recentHistory.add(2)
      expect(recentHistory.isMovingBackwards).to.be.eql(true)

      recentHistory.add(3)
      expect(recentHistory.isMovingBackwards).to.be.eql(false)
    })

    it('ensures that isMovingBackwards works correct: test 2', () => {
      const recentHistory = new RecentHistory([])
      recentHistory.add(0)
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(3)
      recentHistory.add(2)
      expect(recentHistory.backwardsCursor).to.be.eql(2)
      expect(recentHistory.isMovingBackwards).to.be.eql(true)

      recentHistory.add(77)
      expect(recentHistory.isMovingBackwards).to.be.eql(false)
      expect(recentHistory.backwardsCursor).to.be.eql(null)
    })

    it('ensures that isMovingBackwards works correct: test 3', () => {
      const recentHistory = new RecentHistory([])
      recentHistory.add(0)
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(3)
      recentHistory.add(2)
      recentHistory.add(1)
      recentHistory.add(0)
      expect(recentHistory.isMovingBackwards).to.be.eql(true)
      expect(recentHistory.backwardsCursor).to.be.eql(0)
    })

    it('ensures that isMovingBackwards works correct: test 4', () => {
      const recentHistory = new RecentHistory([])
      recentHistory.add(0)
      recentHistory.add(1)
      recentHistory.add(0)
      expect(recentHistory.isMovingBackwards).to.be.eql(true)
    })

    it('ensures that the history length no more than the limit', () => {
      const maxLength = 3

      const recentHistory = new RecentHistory([], { maxLength })
      recentHistory.add(0)
      recentHistory.add(1)
      recentHistory.add(2)
      expect(recentHistory.history.length).to.be.eql(maxLength)
    })

    it('ensures that the history slicing doesnt brake backwards logic: test 1', () => {
      const recentHistory = new RecentHistory([], { maxLength: 3 })
      recentHistory.add(0)
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(3)
      recentHistory.add(4)
      recentHistory.add(3)

      expect(recentHistory.isMovingBackwards).to.be.eql(true)
    })

    it('ensures that the history slicing doesnt brake backwards logic: test 2', () => {
      const recentHistory = new RecentHistory([], { maxLength: 3 })
      recentHistory.add(0)
      recentHistory.add(1)
      recentHistory.add(2)
      recentHistory.add(1)
      recentHistory.add(0)

      expect(recentHistory.backwardsCursor).to.be.eql(null)
    })
  })
})
