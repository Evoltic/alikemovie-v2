const expect = require('chai').expect
const { PiecesManager } = require('./index')

describe('/src/functions', function() {
  const defaultListeners = {
    'key:piece': data => {},
    'piece:value': data => {},
    'piece:piece': data => {}
  }

  context('piecesManager', () => {
    it('ensures that the controls returned by the constructor include valid methods for each type', () => {
      const controls = new PiecesManager(
        {
          exampleString: String,
          exampleObject: Object,
          exampleArray: Array,
          exampleBoolean: Boolean,
          exampleNumber: Number
        },
        defaultListeners
      )

      const {
        exampleString,
        exampleObject,
        exampleArray,
        exampleBoolean,
        exampleNumber,
      } = controls

      expect(exampleString).to.have.keys('setValue')
      expect(exampleObject).to.have.keys('setValue', 'clarify')
      expect(exampleArray).to.have.keys('setValue', 'clarify')
      expect(exampleBoolean).to.have.keys('setValue')
      expect(exampleNumber).to.have.keys('setValue')
    })

    it('ensures that the controls returned by the .clarify include valid methods for each type', () => {
      const { deepObjectExample } = new PiecesManager(
        {
          deepObjectExample: Object
        },
        defaultListeners
      )

      const {
        exampleString,
        exampleBoolean,
        exampleNumber,
        exampleObject,
        exampleArray,
      } = deepObjectExample.clarify({
        exampleString: String,
        exampleBoolean: Boolean,
        exampleNumber: Number,
        exampleObject: Object,
        exampleArray: Array
      })

      expect(exampleString).to.have.keys('setValue')
      expect(exampleBoolean).to.have.keys('setValue')
      expect(exampleNumber).to.have.keys('setValue')
      expect(exampleObject).to.have.keys('setValue', 'clarify')
      expect(exampleArray).to.have.keys('setValue', 'clarify')
    })

    it('ensures that listeners are calling on each method call', () => {
      let calls = []

      const listeners = {
        'key:piece': data => calls.push('key:piece'),
        'piece:value': data => calls.push('piece:value'),
        'piece:piece': data => calls.push('piece:piece')
      }

      const { exampleString, exampleObject, exampleArray } = new PiecesManager(
        {
          exampleString: String,
          exampleObject: Object,
          exampleArray: Array
        },
        listeners
      )
      expect(calls).to.be.eql(['key:piece'])

      exampleString.setValue('example')
      expect(calls.slice(-1)).to.be.eql(['piece:value'])

      exampleObject.setValue({ exampleKey: 'exampleValue' })
      expect(calls.slice(-1)).to.be.eql(['piece:value'])

      const [element1, element2] = exampleArray.clarify([String, String])
      expect(calls.slice(-1)).to.be.eql(['piece:piece'])

      element1.setValue('exampleString')
      element2.setValue('exampleString')
      expect(calls.slice(-2)).to.be.eql(['piece:value', 'piece:value'])

      expect(calls.length).to.be.eql(6)
    })

    it('ensures that grouping several calls in a single listener invocation is working', () => {
      let calls = []

      const listeners = {
        'key:piece': data => calls.push({ t: 'key:piece', data }),
        'piece:value': data => calls.push({t: 'piece:value', data}),
        'piece:piece': data => calls.push({t: 'piece:piece', data})
      }

      const { exampleString, exampleObject, exampleArray } = new PiecesManager(
        {
          exampleString: String,
          exampleObject: Object,
          exampleArray: Array
        },
        listeners
      )
      expect(calls.length).to.be.eql(1)

      exampleString.setValue('example', true)
      expect(calls.length).to.be.eql(1)

      exampleObject.setValue({ exampleKey: 'exampleValue' }, true)
      expect(calls.length).to.be.eql(1)

      const elements = exampleArray.clarify([String, Object], true)
      expect(calls.length).to.be.eql(1)

      elements[0].setValue('abcd', false)
      expect(calls.length).to.be.eql(2)
      // expecting "3" because:
      // 2 setValue calls were with the flag to group, the third - without,
      // so the first two are grouped with the third, so the total is 2 + 1 = 3.
      expect(Object.keys(calls[calls.length - 1].data).length).to.be.eql(3)

      elements[1]
        .clarify({ exampleKey: Number }, false)
        .exampleKey.setValue(12345, false)

      expect(Object.keys(calls[calls.length - 2].data).length).to.be.eql(2)
      expect(Object.keys(calls[calls.length - 1].data).length).to.be.eql(1)

      expect(calls.length).to.be.eql(4)
    })
  })
})
