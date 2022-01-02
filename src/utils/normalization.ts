export interface ObjectWithId {
  id: string
}

export interface Normalized<T> {
  [id: string]: T
}

export const normalize = <T extends ObjectWithId>(
  initialData: T[]
): Normalized<T> =>
  initialData.reduce(
    (result, item) => ({
      ...result,
      [item.id]: item,
    }),
    {}
  )

export const denormalize = <T>(
  normalizedObject: Normalized<T>
): Array<T & ObjectWithId> =>
  Object.entries(normalizedObject).map(([id, value]) => ({
    id,
    ...value,
  }))
