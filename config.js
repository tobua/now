import findCacheDir from 'find-cache-dir'

export const cachePath = findCacheDir({ name: 'create-now', thunk: true })
