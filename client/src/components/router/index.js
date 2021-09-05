import React from 'react'

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
    this.state = {
      CurrentPage: props.CurrentPage,
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

    this.setState({ CurrentPage: this.props.TransitionPage })

    const Page = await page.importPage().then((func) => func())
    this.setState({ CurrentPage: Page })
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleStatePop)
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleStatePop)
  }

  render() {
    // TODO: animate a page change process:
    //  current page (leaving) => transition page (coming, then leaving) => new page (coming)

    return (
      <PageContext.Provider value={{ changePage: this.changePage }}>
        {this.state.CurrentPage}
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
