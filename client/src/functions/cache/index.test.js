import { expect } from 'chai'
import { Cache } from './index'

describe('/functions/cache', function () {
  context('Cache', () => {
    it('ensures that added resources could be got', () => {
      const cache = new Cache()

      cache.addResources([{ message: '1' }, { message: '2' }, { message: '3' }])
      expect(cache.getResources([0, 1, 2], true)).to.eql([
        { message: '1' },
        { message: '2' },
        { message: '3' },
      ])
    })

    it('ensures that one level merging for resources with the same keys works', () => {
      const cache = new Cache()

      cache.addResources(
        [{ id: '1' }, { id: '2' }, { id: '2', someProp: 'some' }],
        {
          resolveResourceKey: (resource) => resource.id,
        }
      )

      expect(cache.getResources(['1', '2'], true)).to.eql([
        { id: '1' },
        { id: '2', someProp: 'some' },
      ])
    })

    it('ensures that resources grouping works', () => {
      const cache = new Cache()

      const group1 = [{ id: '1' }, { id: '2' }, { id: '5' }]
      const group2 = [{ id: '4' }, { id: '3' }, { id: '6' }, { id: '7' }]

      cache.addResources(group1.slice(0, 1), {
        groupKey: 'group1',
        resolveResourceKey: (resource) => resource.id,
      })
      cache.addResources(group1.slice(1), {
        groupKey: 'group1',
        resolveResourceKey: (resource) => resource.id,
      })

      cache.addResources(group2, {
        groupKey: 'group2',
        resolveResourceKey: (resource) => resource.id,
      })

      expect(cache.getResourcesGroup('group1', true)).to.eql(group1)
      expect(cache.getResourcesGroup('group2', true)).to.eql(group2)
    })

    it('ensures that resources order works correctly and the resource group is deleted if at least one of the resources deleted', () => {
      const cache = new Cache({
        maximumResourcesLimit: 3,
        minimumResourcesLimit: 2,
      })

      cache.addResources([{ id: '1' }], {
        groupKey: 'group1',
        resolveResourceKey: (resource) => resource.id,
      })
      cache.addResources([{ id: '2' }], {
        groupKey: 'group1',
        resolveResourceKey: (resource) => resource.id,
      })
      cache.addResources([{ id: '3' }], {
        groupKey: 'group1',
        resolveResourceKey: (resource) => resource.id,
      })
      cache.addResources([{ id: '4' }], {
        groupKey: 'group1',
        resolveResourceKey: (resource) => resource.id,
      })

      cache.getResources(['1', '3'])

      expect(cache.getResources(['1', '2', '3', '4'], true)).to.eql([
        { id: '1' },
        undefined,
        { id: '3' },
        undefined,
      ])
      expect(cache.getResourcesGroup('group1', true)).to.eql(undefined)
    })

    it('ensures that "options.fieldWithResourceKey" works', () => {
      const cache = new Cache()

      cache.addResources([{ id: 'a' }, { id: 'b' }], {
        fieldWithResourceKey: 'id',
      })

      expect(cache.getResources(['a', 'b'], true)).to.eql([
        { id: 'a' },
        { id: 'b' },
      ])
    })
  })
})
