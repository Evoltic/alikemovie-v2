import React from 'react'
import debounce from 'lodash.debounce'
import { Markup } from './markup'
import { attachWorker } from '/components/autoWorker'
import { PageContext } from '/components/router'

export const SearchBox = attachWorker(
  class extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        isDropdownOpen: false,
        currentItemIndex: 0,
        isPending: false,
        isNotFound: false,
        isUnknownError: false,
        hint: null,
        inputValue: '',
        items: [],
      }
      this.searchesStarted = 0
      this.ref = React.createRef()
    }

    static contextType = PageContext

    submit = () => {
      const item = this.state.items[this.state.currentItemIndex]

      // TODO: cache the movie, so then on the movie page the movie could be
      //  resolved from the cache

      this.closeDropdown()
      this.context.changePage(`/movies/${item.id}`)
    }

    closeDropdown = (e) => {
      this.setState({ isDropdownOpen: false })
    }

    openDropdown = (e) => {
      this.setState({ isDropdownOpen: true })
    }

    makeNextItemCurrent = () => {
      if (this.state.items.length === 0) return null

      if (this.state.currentItemIndex === this.state.items.length - 1) {
        this.setState({ currentItemIndex: 0 })
      } else {
        this.setState({ currentItemIndex: this.state.currentItemIndex + 1 })
      }
    }

    makePreviousItemCurrent = () => {
      if (this.state.items.length === 0) return null

      if (this.state.currentItemIndex === 0) {
        this.setState({ currentItemIndex: this.state.items.length - 1 })
      } else {
        this.setState({ currentItemIndex: this.state.currentItemIndex - 1 })
      }
    }

    handleItemClick = (e, index) => {
      this.setState({ currentItemIndex: index }, this.submit)
    }

    search = debounce(async (query) => {
      this.searchesStarted++
      const currentSearchNumber = this.searchesStarted

      this.setState({ isPending: true })

      const {
        items,
        isNotFound = false,
        hint = null,
        isUnknownError = false,
      } = await this.props.workers[0]
        .do('performServerMethod', 'searchMovies', { query })
        .then((items) =>
          items.length === 0 ? { isNotFound: true } : { items }
        )
        .catch((err) => ({ isUnknownError: true }))

      const isThisSearchOutdated = this.searchesStarted > currentSearchNumber
      if (isThisSearchOutdated) return

      this.setState(
        {
          items,
          isNotFound,
          hint,
          isUnknownError,
          isPending: false,
          currentItemIndex: 0,
        },
        () => this.openDropdown()
      )
    }, 500)

    handleInputChange = (e) => {
      const inputValue = e.target.value
      this.setState({ inputValue })

      this.search(inputValue)
    }

    handleKeyDown = (e) => {
      if (this.state.isDropdownOpen === false) return

      if (e.key === 'Enter') return this.submit()
      if (e.key === 'ArrowDown') return this.makeNextItemCurrent()
      if (e.key === 'ArrowUp') return this.makePreviousItemCurrent()
      if (e.key === 'Escape') return this.closeDropdown()
    }

    handleDocumentClick = (e) => {
      if (this.state.isDropdownOpen === false) return

      const isClickedInsideComponent = this.ref.current.contains(e.target)
      if (!isClickedInsideComponent) this.closeDropdown()
    }

    componentDidMount = () => {
      document.addEventListener('click', this.handleDocumentClick)
      document.addEventListener('keydown', this.handleKeyDown)
    }

    componentWillUnmount = () => {
      document.removeEventListener('click', this.handleDocumentClick)
      document.removeEventListener('keydown', this.handleKeyDown)
    }

    render() {
      return (
        <Markup
          markupRef={this.ref}
          //
          openDropdown={this.openDropdown}
          isDropdownOpen={this.state.isDropdownOpen}
          //
          handleInputChange={this.handleInputChange}
          inputValue={this.state.inputValue}
          //
          isPending={this.state.isPending}
          isNotFound={this.state.isNotFound}
          isUnknownError={this.state.isUnknownError}
          hint={this.state.hint}
          //
          items={this.state.items}
          currentItemIndex={this.state.currentItemIndex}
          handleItemClick={this.handleItemClick}
        />
      )
    }
  },
  '/functions/serverApi/index.worker.js'
)
