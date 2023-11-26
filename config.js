import { join } from 'path'
import findCacheDir from 'find-cache-dir'
import temporaryDirectory from 'temp-dir'

const nodeModulesCacheDir = findCacheDir({ name: 'create-now', thunk: true })
const npxCacheDirectory = () => join(temporaryDirectory, 'create-now')

export function cachePath(name) {
  const path = nodeModulesCacheDir ?? npxCacheDirectory()
  return join(path, name)
}
