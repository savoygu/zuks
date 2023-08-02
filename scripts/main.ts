import { defineCommand, runMain } from 'citty'
import { commands } from './commands'

export const main = defineCommand({
  meta: {
    name: 'zuks',
    description: 'Zuks Scripts',
  },
  subCommands: commands,
})

runMain(main)
