const avarage = require('../utils/for_testing').avarage

describe('avarage', () => {
  test('of value is value itself', () => {
    expect(avarage([1])).toBe(1)
  })

  test('avarage is calculated rigth', () => {
    expect(avarage([1,2,3,4,5])).toBe(3)
  })

  test('avarage of empty array', () => {
    expect(avarage([])).toBe(0)
  })
})