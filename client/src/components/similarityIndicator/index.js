import React from 'react'
import { Markup } from './markup'

export class SimilarityIndicator extends React.Component {
  calculateColor(percent) {
    const red = percent < 80 ? 100 : 100 - percent
    const green = percent < 80 ? percent + 30 : 100
    const blue = percent < 80 ? 10 : 30

    return `${red}%,${green}%,${blue}%`
  }

  chooseWord(percent, words) {
    const possibleStep = 100 / words.length
    const step = possibleStep > 25 ? 25 : possibleStep

    const stepsPassed = Math.floor((100 - percent) / step)

    const lastIndex = words.length - 1
    return stepsPassed > lastIndex ? words[lastIndex] : words[stepsPassed]
  }

  calculate(current, maximum, minimum, words) {
    const percent = ((current - minimum) / (maximum - minimum)) * 100
    return {
      percent,
      word: this.chooseWord(percent, words),
      color: this.calculateColor(percent),
    }
  }

  render() {
    const { value, maxValue, minValue, words, className } = this.props
    const { word, color, percent } = this.calculate(
      value,
      maxValue,
      minValue,
      words
    )

    return (
      <Markup
        className={className}
        word={word}
        color={color}
        percent={percent}
      />
    )
  }
}
