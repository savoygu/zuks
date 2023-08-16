export type KvOrCb<T, U> = [string, string] | ((data: T | null) => U[])

export interface LabelValue {
  label: keyof any
  value: keyof any
}
