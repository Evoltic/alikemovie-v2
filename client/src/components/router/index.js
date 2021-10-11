import React from 'react'
import { RecentHistory } from '/functions/recentHistory'
import { CoexistingPages } from '/functions/coexistingPages'

const PageContext = React.createContext({
  changePage: () => {
    console.warn(
      `"changePage" handler is not defined. ` +
        `Make "<Router>" component a parent of "<Link />" in the tree.`
    )
  },
})

class Router extends React.Component {
  constructor(props) {
    super(props)

    this.coexistingPages = new CoexistingPages({
      initial: props.CurrentPage,
      lifetimeMs: props.pageAfterLifeTimeMs || 3000,
      minPagesLimit: 1,
      maxPagesLimit: 2,
      callback: (pages) => this.setState({ pages }),
    })

    this.recentHistory = new RecentHistory(
      typeof location !== 'undefined' ? [location.pathname] : [],
      { maxLength: 4 }
    )

    this.state = {
      pages: this.coexistingPages.list,
      isMovingBackwards: this.recentHistory.isMovingBackwards,
    }
  }

  changePage = async (to) => {
    history.pushState({}, '', to)
    window.dispatchEvent(new Event('popstate'))
  }

  handleStatePop = async () => {
    const { pathname } = location

    const page = this.props.allPages.find((page) => page.route.test(pathname))
    if (!page) throw new Error(`can't find the page that matches "${pathname}"`)

    const importPage = async () => {
      this.coexistingPages.outdateEvery()

      try {
        const Page = await Promise.race([
          page.importPage().then((func) => func()),
          new Promise((resolve, reject) => setTimeout(reject, 10000)),
        ])
        this.coexistingPages.add(Page)
      } catch (e) {
        location.reload()
      }
    }

    this.recentHistory.add(pathname, ({ isMovingBackwards }) =>
      this.setState({ isMovingBackwards }, importPage)
    )
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleStatePop)
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleStatePop)
  }

  render() {
    const {
      className = '',
      pageClassName = '',
      Header,
      TransitionPage,
      shouldBeMultiPaging = false,
    } = this.props

    const { pages, isMovingBackwards } = this.state
    const status =
      pages.slice(-1)[0].status === 'outdated' ? 'awaiting' : 'ready'

    return (
      <PageContext.Provider value={{ changePage: this.changePage }}>
        <div
          className={className}
          data-router-status={status}
          data-router-movement={isMovingBackwards ? 'backwards' : 'forwards'}
        >
          {Header}
          {status === 'awaiting' && TransitionPage}
          {pages
            .map((page) => (
              <div
                className={pageClassName}
                data-router-page-status={page.status}
                key={page.id}
              >
                {page.component}
              </div>
            ))
            .slice(shouldBeMultiPaging ? 0 : -1)}
        </div>
      </PageContext.Provider>
    )
  }
}

function Link(props) {
  const { to, children = '', className = '' } = props

  const handleClick = (event, changePage) => {
    event.preventDefault()
    changePage(to)
  }

  return (
    <PageContext.Consumer>
      {({ changePage }) => {
        return (
          <a
            className={className}
            href={to}
            onClick={(e) => handleClick(e, changePage)}
          >
            {children}
          </a>
        )
      }}
    </PageContext.Consumer>
  )
}

export { Link, Router, PageContext }
