import {makeWorker} from "/functions/workerWrapper/makeWorker"

function calculate(a,b) {
  return a + b
}

makeWorker({
  calculate
})
