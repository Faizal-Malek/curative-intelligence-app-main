// Minimal TypeScript declarations for the parts of `pg` used in this project.
// These intentionally only declare `Client` and `Pool` to provide type safety
// and remove the editor warning when `@types/pg` is not installed.
declare module 'pg' {
  // Generic shape for a query result
  export interface QueryResult<T = any> {
    rows: T[]
    rowCount: number
  }

  export type QueryParams = any[] | undefined

  export class Client {
    constructor(config?: any)
    connect(): Promise<void>
    query<T = any>(queryText: string, params?: QueryParams): Promise<QueryResult<T>>
    on(event: 'notification', listener: (msg: { channel: string; payload: string }) => void): this
    on(event: 'error' | 'end' | 'connect', listener: (...args: any[]) => void): this
    end(): Promise<void>
  }

  export class Pool {
    constructor(config?: any)
    connect(): Promise<PoolClient>
    query<T = any>(queryText: string, params?: QueryParams): Promise<QueryResult<T>>
    end(): Promise<void>
  }

  export interface PoolClient extends Client {
    release(): void
  }


  // Export additional helper types if needed
  export { }
}
