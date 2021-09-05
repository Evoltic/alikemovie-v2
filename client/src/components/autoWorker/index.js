import React from 'react'
import { useWorker } from '/functions/workerWrapper/useWorker'

function attachWorker(OriginalComponent, workerPath) {
  class ModifiedComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        workerMethods: null,
      }
      this.isWorkerStillRelevant = true
      this.queue = []
    }

    executeQueue() {
      this.queue.map((task) =>
        this.state.workerMethods[task.methodName](...task.args)
          .then(task.resolve)
          .catch(task.reject)
      )

      this.queue = []
    }

    componentDidMount() {
      useWorker(workerPath)
        .then((workerMethods) => {
          if (this.isWorkerStillRelevant) {
            this.setState({ workerMethods })
            this.executeQueue()
          } else {
            this.state.workerMethods.destroyContext()
          }
        })
        .catch((err) => console.log(err))
    }

    componentWillUnmount() {
      this.isWorkerStillRelevant = false
      this.queue.map((task) =>
        task.reject(
          'the component will unmount, so no need for the task anymore'
        )
      )
      if (this.state.workerMethods) this.state.workerMethods.destroyContext()
    }

    get worker() {
      const isWorkerReady = this.state.workerMethods !== null

      return {
        do: (methodName, ...args) => {
          if (isWorkerReady) {
            return this.state.workerMethods[methodName](...args)
          } else {
            return new Promise((resolve, reject) => {
              this.queue.push({ methodName, args, resolve, reject })
            })
          }
        },
      }
    }

    render() {
      return (
        <OriginalComponent
          {...this.props}
          workers={[...(this.props.workers || []), this.worker]}
        />
      )
    }
  }

  return ModifiedComponent
}

export { attachWorker }
