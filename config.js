import { join } from 'path'

export const gitStorePath = '.create-now-temporary'
export const gitStorePathAbsolute = join(process.cwd(), gitStorePath)
