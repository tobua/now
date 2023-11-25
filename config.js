import { join } from 'path'
import findCacheDir from 'find-cache-dir'
import temporaryDirectory from 'temp-dir'

const nodeModulesCacheDir = findCacheDir({ name: 'create-now', thunk: true })
const npxCacheDirectory = (template) => join(temporaryDirectory, 'create-now', template)

export function cachePath() {
  const path = nodeModulesCacheDir ?? npxCacheDirectory
  return typeof path === 'function' ? path() : path
}
