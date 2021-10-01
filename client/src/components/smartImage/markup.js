import React from 'react'

export const Markup = (props) => {
  const { className, src, imageRef, handleError, ...rest } = props

  return (
    <img
      className={className}
      src={src}
      ref={imageRef}
      onError={handleError}
      {...rest}
    />
  )
}
