import { join } from 'path'
import findCacheDir from 'find-cache-dir'
import temporaryDirectory from 'temp-dir'

const nodeModulesCacheDir = findCacheDir({ name: 'create-now', thunk: true })
const npxCacheDirectory = (template) => join(temporaryDirectory, 'create-now', template)

export const cachePath = nodeModulesCacheDir || npxCacheDirectory
