import { ServerApi } from './index.js'
import { makeWorker } from '/functions/workerWrapper/makeWorker'

const serverApi = new ServerApi()

const performServerMethod = (methodName, data = {}) => {
  return new Promise((resolve, reject) => {
    serverApi.perform(methodName, data, (err, res) =>
      err ? reject(err) : resolve(res)
    )
  })
}

function performServerMethodAndWriteToState(methodName, data = {}) {
  return new Promise((resolve, reject) => {
    serverApi.perform(methodName, data, (err, res, isLastCall) => {
      if (err) reject(err)
      else this.setPublicState(() => ({ [methodName]: res }))

      if (isLastCall) resolve(res)
    })
  })
}

const writeToStateOnServerApiGeneralError = () => {
  serverApi.handleGeneralError = error =>
    this.setPublicState(() => error)
}

makeWorker({
  performServerMethod,
  performServerMethodAndWriteToState,
  writeToStateOnServerApiGeneralError
})
