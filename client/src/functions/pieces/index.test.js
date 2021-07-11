import { expect } from 'chai'
import { Pieces } from './index'

describe('/functions/pieces', function() {
  context('Pieces', () => {
    it('checks main methods on correct state updating and working in tandem', () => {
      const pieces = new Pieces()

      pieces.setSchema({
        movieName: 123,
        thumbnail: 234,
        similarMovies: 345,
        similarMoviesDeep: 456
      })
      expect(pieces.currentState).to.be.eql({
        movieName: undefined,
        thumbnail: undefined,
        similarMovies: undefined,
        similarMoviesDeep: undefined
      })

      pieces.setValue({
        123: 'avengers',
        234: 'https://pictures.com/avengers-thumbnail'
      })
      expect(pieces.currentState).to.be.eql({
        movieName: 'avengers',
        thumbnail: 'https://pictures.com/avengers-thumbnail',
        similarMovies: undefined,
        similarMoviesDeep: undefined
      })

      pieces.clarify({ 345: [999, 9999] })
      expect(pieces.currentState).to.be.eql({
        movieName: 'avengers',
        thumbnail: 'https://pictures.com/avengers-thumbnail',
        similarMovies: [undefined,undefined],
        similarMoviesDeep: undefined
      })

      pieces.setValue({ 999: 'iron man 1' })
      expect(pieces.currentState).to.be.eql({
        movieName: 'avengers',
        thumbnail: 'https://pictures.com/avengers-thumbnail',
        similarMovies: ['iron man 1',undefined],
        similarMoviesDeep: undefined
      })

      pieces.clarify({ 456: { movie: 888 } })
      expect(pieces.currentState).to.be.eql({
        movieName: 'avengers',
        thumbnail: 'https://pictures.com/avengers-thumbnail',
        similarMovies: ['iron man 1',undefined],
        similarMoviesDeep: { movie: undefined }
      })

      pieces.clarify({ 888: { name: 777 } })
      expect(pieces.currentState).to.be.eql({
        movieName: 'avengers',
        thumbnail: 'https://pictures.com/avengers-thumbnail',
        similarMovies: ['iron man 1',undefined],
        similarMoviesDeep: { movie: { name: undefined } }
      })

      pieces.setValue({777: 'example' })
      expect(pieces.currentState).to.be.eql({
        movieName: 'avengers',
        thumbnail: 'https://pictures.com/avengers-thumbnail',
        similarMovies: ['iron man 1',undefined],
        similarMoviesDeep: { movie: { name: 'example' } }
      })
    })
  })
})
