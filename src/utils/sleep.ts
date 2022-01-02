const sleep = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))

export default sleep

