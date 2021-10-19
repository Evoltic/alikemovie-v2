import { expect } from 'chai'
import { lowercaseFirstLetter } from './index'

describe('/functions/lowercaseFirstLetter', function () {
  context('lowercaseFirstLetter', () => {
    it('ensures the first letter in a sentence is lowercase', () => {
      expect(lowercaseFirstLetter('Okay Okay Okay')).to.eql('okay Okay Okay')
    })
  })
})
