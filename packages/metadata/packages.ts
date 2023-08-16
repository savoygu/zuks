import type { PackageManifest } from '@vueuse/metadata'

export const packages: PackageManifest[] = [
  {
    name: 'metadata',
    display: 'Metadata for Vue Component Library functions',
    manualImport: true,
    iife: false,
    utils: true,
    target: 'node14',
  },
  {
    name: 'shared',
    display: 'Shared utilities',
  },
  {
    name: 'core',
    display: 'Zuks',
    description: 'Collection of essential Vue Component Library Composition Utilities',
  },
]
