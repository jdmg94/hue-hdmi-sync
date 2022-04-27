const sleep = (timeout: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, timeout))

export default sleep
