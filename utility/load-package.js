import fetch from 'node-fetch'
import { log } from './log.js'

const getUrlFromManifest = (manifest) => {
  let url = manifest.repository.url

  const matches = [...url.matchAll(/.*github\.com\/([^\/\.]+\/[^\/\.]+).*$/g)]

  if (matches[0] && matches[0][1]) {
    return matches[0][1]
  }

  log(`Couldn't parse package repository url ${url}`, 'error')
}

// Loads package metadata (git repo address).
export const loadPackage = async (packageName) => {
  let manifest = {}

  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`)
    manifest = await response.json()
  } catch (error) {
    log(`Couldn't find package ${packageName} on npm`, 'error')
  }

  if (!manifest.repository || !manifest.repository.url) {
    log(`Package ${packageName} has no repository field`, 'error')
  }

  return getUrlFromManifest(manifest)
}
