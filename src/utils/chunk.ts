const chunk = <T>(
  data: Array<T>,
  chunkSize: number
): Array<Array<T>> => {
  const result: Array<Array<T>> = []
  for (let i = 0; i < data.length; i += chunkSize) {
    result.push(data.slice(i, i + chunkSize))
  }

  return result
}

export default chunk
