const expect = require('chai').expect
const { removeDuplicatesBy } = require('./index')

describe('/src/functions', function() {
  context('removeDuplicatesBy', () => {
    it('should get an array without duplicates', () => {
      const array = [{ name: 'test' }, { name: 'test1' }, { name: 'test' }]
      const expectedOutput = [{ name: 'test' }, { name: 'test1' }]

      const output = removeDuplicatesBy(item => item.name, array)

      expect(output).to.deep.equal(expectedOutput)
    })
  })
})
