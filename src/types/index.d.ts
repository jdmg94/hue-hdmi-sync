import type { Response } from "node-fetch"

interface TypedResponse<T = any> extends Response {
  json<P = T>(): Promise<P>
}

declare function fetch<T>(...args: any): Promise<TypedResponse<T>>
