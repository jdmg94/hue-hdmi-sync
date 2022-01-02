import { normalize, denormalize } from "./normalization"

const regularObject1 = {
  id: "foo",
  bar: "baz",
}

const regularObject2 = {
  id: "baz",
  foo: "bar",
}

const inputStub = [regularObject1, regularObject2]

const expectedOutput = {
  foo: regularObject1,
  baz: regularObject2,
}

describe('normalization', () => {
  it('should take a regular object array and normalize it to an object', () => {
    const result = normalize(inputStub)

    expect(result).toBe(expectedOutput)
  })

  it('should take a normalized object and reversed it into an object array', () => {
    const result = denormalize(expectedOutput)

    expect(inputStub).toBe(result)
  })
})