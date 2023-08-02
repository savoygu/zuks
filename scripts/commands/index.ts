import type { CommandDef } from 'citty'

const _rDefault = (r: any) => (r.default || r) as Promise<CommandDef>

export const commands = {
  build: () => import('./build').then(_rDefault),
  update: () => import('./update').then(_rDefault),
  publish: () => import('./publish').then(_rDefault),
}
