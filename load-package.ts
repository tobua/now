import { log } from './log'

type Manifest = { repository: { url: string } }

const getUrlFromManifest = (manifest: Manifest) => {
  const { url } = manifest.repository

  const matches = [...url.matchAll(/.*github\.com\/([^/.]+\/[^/.]+).*$/g)]

  if (matches[0]?.[1]) {
    return matches[0][1]
  }

  log(`Couldn't parse package repository url ${url}`, 'error')
}

// Loads package metadata (git repo address).
export const loadPackage = async (packageName: string) => {
  let manifest: Partial<Manifest> = {}

  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`)
    manifest = await response.json()
  } catch (_error) {
    log(`Couldn't find package ${packageName} on npm`, 'error')
  }

  if (!manifest.repository?.url) {
    log(`Package ${packageName} has no repository field`, 'error')
  }

  return getUrlFromManifest(manifest as Manifest) as string
}
