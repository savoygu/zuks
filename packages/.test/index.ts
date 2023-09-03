
export const isBelowNode18 = Number(process.version.slice(1).split('.')[0]) < 18

export * from './retry'
export * from './fetcher'
export * from './types'
