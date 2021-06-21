function removeDuplicatesBy(getValueFn, array) {
  const allValues = new Set()

  return array.filter(item => {
    const value = getValueFn(item)
    const isNewValue = !allValues.has(value)
    if (isNewValue) allValues.add(value)
    return isNewValue
  })
}

module.exports = { removeDuplicatesBy }
