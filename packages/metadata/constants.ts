import { resolve as _resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const resolve = (...paths: string[]) => _resolve(__dirname, ...paths)

export const DIR_METADATA = resolve('.') // zuks/packages/metadata
export const DIR_ROOT = resolve('../..') // zuks
export const DIR_PACKAGES = resolve(DIR_ROOT, 'packages') // zuks/packages
export const DIR_TYPES = resolve(DIR_ROOT, 'types/packages') // zuks/types/packages

export const DOCS_URL = 'https://zuks.netlify.app'
export const GITHUB_BLOB_URL = 'https://github.com/savoygu/zuks/blob/main/packages'
