import { join } from 'node:path'
import findCacheDir from 'find-cache-dir'
import temporaryDirectory from 'temp-dir'

const nodeModulesCacheDir = findCacheDir({ name: 'create-now' })
const npxCacheDirectory = () => join(temporaryDirectory, 'create-now')

export function cachePath(name: string) {
  const path = nodeModulesCacheDir ?? npxCacheDirectory()
  return join(path, name)
}
