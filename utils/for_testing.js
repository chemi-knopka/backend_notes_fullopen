const palindrome = (string) => {
  return string
    .split('')
    .reverse()
    .join('')
}

const avarage = (array) => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0
    ? 0
    : array.reduce(reducer, 0) / array.length
}

module.exports = {
  palindrome,
  avarage
}