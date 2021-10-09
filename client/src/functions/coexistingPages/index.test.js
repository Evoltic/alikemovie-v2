import { expect } from 'chai'
import { CoexistingPages } from './index'

describe('/functions/сoexistingPages', function () {
  context('СoexistingPages', () => {
    it('ensures .add adds to list and maintains passed component', () => {
      const pages = new CoexistingPages()
      pages.add('example')
      expect(pages.list.length).to.eql(1)
      expect(pages.list[0].component).to.eql('example')
    })

    it('ensures every id is unique', () => {
      const pages = new CoexistingPages()
      pages.add('example')
      pages.add('example')
      pages.add('example')
      pages.add('example')
      pages.add('example')

      const list = pages.list

      let areIdsUnique = true
      for (let i = 0; i < list.length; i++) {
        const isSomeEqual = list.some((page, j) => {
          if (j === i) return false
          return list[i].id === list[j].id
        })
        if (isSomeEqual) {
          areIdsUnique = false
          break
        }
      }

      expect(areIdsUnique).to.eql(true)
    })

    it('ensures lifetime works: 1000ms', async () => {
      const pages = new CoexistingPages({
        lifetimeMs: 1000,
        maxPagesLimit: 3,
        minPagesLimit: 1,
      })

      pages.add(1)
      pages.add(2)
      pages.add(3)
      pages.add(4)

      await new Promise((resolve) => setTimeout(resolve, 500))
      expect(pages.list.length).to.eql(4)

      await new Promise((resolve) => setTimeout(resolve, 500))
      expect(pages.list.length).to.eql(1)
    })

    it('ensures lifetime works: 0ms', async () => {
      const pages = new CoexistingPages({
        lifetimeMs: 0,
        maxPagesLimit: 3,
        minPagesLimit: 1,
      })

      pages.add(1)
      pages.add(2)
      pages.add(3)
      pages.add(4)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(pages.list.length).to.eql(1)
    })

    it('ensures callback is called with the actual list', async () => {
      let list = undefined

      const pages = new CoexistingPages({
        callback: (l) => (list = l),
        maxPagesLimit: 3,
        minPagesLimit: 1,
      })

      pages.add(1)
      pages.add(2)
      pages.add(3)
      pages.add(4)
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(list[0].component).to.eql(4)
    })
  })
})
