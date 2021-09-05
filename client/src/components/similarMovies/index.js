import React from 'react'
import { Markup } from './markup'
import { attachWorker } from '/components/autoWorker'

export const SimilarMovies = attachWorker(
  class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        items: [],
        isPending: true,
        isNotFound: false,
        isUnknownError: false,
      }
    }

    async componentDidMount() {
      // TODO: check in cache first

      const {
        items = [],
        isNotFound = false,
        isUnknownError = false,
      } = await this.props.workers[0]
        .do('performServerMethod', 'getSimilarMovies', {
          movieId: this.props.movieId,
        })
        .then((items) =>
          items.length === 0 ? { isNotFound: true } : { items }
        )
        .catch((err) => ({ isUnknownError: true }))

      this.setState({ items, isNotFound, isUnknownError, isPending: false })
    }

    render() {
      return (
        <Markup
          items={this.state.items}
          isPending={this.state.isPending}
          isNotFound={this.state.isNotFound}
          isUnknownError={this.state.isUnknownError}
        />
      )
    }
  },
  '/functions/serverApi/index.worker.js'
)
