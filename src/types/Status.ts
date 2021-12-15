export const Status = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  DONE: 'DONE',
  ERROR: 'ERROR',
} as const

export type StatusType = typeof Status[keyof typeof Status]
