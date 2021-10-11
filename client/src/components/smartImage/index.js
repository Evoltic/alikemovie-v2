import React from 'react'
import { Markup } from './markup'
import placeholderImage from '/assets/images/placeholder_264x330.jpg'
import placeholder404Image from '/assets/images/placeholder404_264x330.jpg'

export class SmartImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      src: placeholderImage,
      isErrored: false,
    }
    this.ref = React.createRef()
    this.observer = undefined
  }

  switchImageSrc = () => {
    this.setState({ src: this.props.src })
    this.unobserve()
  }

  observe = () => {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) this.switchImageSrc()
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    )

    this.observer.observe(this.ref.current)
  }

  unobserve = () => {
    if (this.observer) this.observer.unobserve(this.ref.current)
  }

  componentDidMount() {
    try {
      this.observe()
    } catch (e) {
      this.switchImageSrc()
    }
  }

  componentWillUnmount() {
    this.unobserve()
  }

  handleError = (event) => {
    if (this.state.isErrored) return
    this.setState({ isErrored: true, src: placeholder404Image })
  }

  render() {
    return (
      <Markup
        {...this.props}
        imageRef={this.ref}
        src={this.state.src}
        handleError={this.handleError}
      />
    )
  }
}
