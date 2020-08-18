import pacote from 'pacote'
import { log } from './log.js'

// Loads package metadata (git repo address).
export const loadPackage = async (packageName) => {
  let manifest = {}

  try {
    manifest = await pacote.manifest(packageName)
  } catch (error) {
    log(`Couldn't find package ${packageName} on npm.`, 'error')
    process.exit(0)
  }

  if (!manifest.repository) {
    log(`Package ${packageName} has no repository field.`, 'error')
    process.exit(0)
  }

  return manifest.repository
}
