const expect = require('chai').expect
const proxyquire = require('proxyquire')

describe('/src/functions/tsvParser', () => {
  class TransformMock {
    constructor() {
      this.stack = []
    }
    push(data) {
      this.stack.push(data)
    }
  }
  function simulateTransformStream(stream, chunks, encoding) {
    let result = []

    const callback = (err, res) => {
      if (res) stream.push(res)
      result.push(...stream.stack)
      stream.stack = []
    }

    for (const chunk of chunks) {
      stream._transform(chunk, encoding, callback)
    }
    stream._flush(callback)

    return result.map(json => JSON.parse(json))
  }

  context('TsvParser._transform', () => {
    it('should correctly combine chunks to a line', () => {
      const { TsvParser } = proxyquire('./index', {
        stream: { Transform: TransformMock }
      })

      const chunks = [
        Buffer.from(`nconst\tprimaryName\tbirthYear\n`),
        Buffer.from('nm0000001\tFred Astaire\t1899\n'),
        Buffer.from(
          'nm0000002\tLauren Bacall\t1924\nnm0000003\tBrigitte Bardot\t1934'
        )
      ]

      const output = simulateTransformStream(
        new TsvParser(),
        chunks,
        'buffer'
      )
      const expectedOutput = [
        ['nconst', 'primaryName', 'birthYear'],
        ['nm0000001', 'Fred Astaire', '1899'],
        ['nm0000002', 'Lauren Bacall', '1924'],
        ['nm0000003', 'Brigitte Bardot', '1934'],
      ]

      expect(output).to.eql(expectedOutput)
    })

    it('should correctly combine chunks to a line: omit header', () => {
      const { TsvParser } = proxyquire('./index', {
        stream: { Transform: TransformMock }
      })

      const chunks = [
        Buffer.from(`nconst\tprimaryName\tbirthYear\n`),
        Buffer.from('nm0000001\tFred Astaire\t1899\n'),
        Buffer.from(
          'nm0000002\tLauren Bacall\t1924\nnm0000003\tBrigitte Bardot\t1934'
        )
      ]

      const output = simulateTransformStream(
        new TsvParser({ shouldHeaderBeIncluded: false }),
        chunks,
        'buffer'
      )
      const expectedOutput = [
        ['nm0000001', 'Fred Astaire', '1899'],
        ['nm0000002', 'Lauren Bacall', '1924'],
        ['nm0000003', 'Brigitte Bardot', '1934'],
      ]

      expect(output).to.eql(expectedOutput)
    })
  })
})
