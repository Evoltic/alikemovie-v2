import React from 'react'
import { AutoWorker } from '/functions/workerWrapper/autoWorker'

function attachWorker(OriginalComponent, workerPath) {
  class ModifiedComponent extends React.Component {
    constructor(props) {
      super(props)
      this.autoWorker = new AutoWorker(workerPath)
    }

    componentDidMount() {
      this.autoWorker.create()
    }

    componentWillUnmount() {
      this.autoWorker.destroy()
    }

    render() {
      return (
        <OriginalComponent
          {...this.props}
          workers={[...(this.props.workers || []), { do: this.autoWorker.do }]}
        />
      )
    }
  }

  return ModifiedComponent
}

export { attachWorker }
