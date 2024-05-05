import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import axios from 'axios'
import { decompress } from './decompress'
import { log } from './log'

async function downloadFile(url: string, extractDirectory: string) {
  if (!existsSync(extractDirectory)) {
    mkdirSync(extractDirectory, { recursive: true })
  }

  const zipFilePath = join(process.cwd(), `temp-${Math.floor(Math.random() * (999 - 1 + 1) + 1)}.zip`)
  const body = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  writeFileSync(zipFilePath, Buffer.from(body.data))
  await decompress(zipFilePath, extractDirectory)
  unlinkSync(zipFilePath)

  return false
}

// Custom implementation of the 'download-git-repo' package.
export async function download(url: string, destination: string) {
  const respository = normalize(url)
  const fullUrl = respository.url || getUrl(respository)

  if (!url) {
    log('Repository not found', 'error')
    return
  }

  const error = await downloadFile(fullUrl, destination)

  if (error) {
    log(`Failed to download repository contents from ${fullUrl}`, 'error')
    return
  }

  return true
}

const normalize = (url: string) => {
  let regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
  let match = regex.exec(url)

  if (match) {
    // TODO customizable branch.
    const [_, , url, directCheckout = 'main'] = match
    return {
      type: 'direct',
      url,
      checkout: directCheckout,
    }
  }

  regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/
  match = regex.exec(url)
  const [_, type = 'github', origin, owner, name, checkout = 'main'] = match ?? []
  return {
    type,
    origin: origin ?? (type === 'github' ? 'github.com' : type === 'gitlab' ? 'gitlab.com' : 'bitbucket.org'),
    owner,
    name,
    checkout,
  }
}

function addProtocol(origin: string) {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    return `https://${origin}`
  }

  return origin
}

function getUrl(repository: ReturnType<typeof normalize>) {
  let url = ''

  // Get origin with protocol and add trailing slash or colon (for ssh)
  let origin = addProtocol(repository.origin as string)
  if (/^git@/i.test(origin)) {
    origin = `${origin}:`
  } else {
    origin = `${origin}/`
  }

  if (repository.type === 'github') {
    url = `${origin + repository.owner}/${repository.name}/archive/${repository.checkout}.zip`
  } else if (repository.type === 'gitlab') {
    url = `${origin + repository.owner}/${repository.name}/repository/archive.zip?ref=${repository.checkout}`
  } else if (repository.type === 'bitbucket') {
    url = `${origin + repository.owner}/${repository.name}/get/${repository.checkout}.zip`
  }

  return url
}

export async function downloadTemplate(url: string, cachePath: string) {
  const success = await download(url, cachePath)

  if (!success) {
    log(`Couldn't download repository from ${url}`, 'error')
  }
}
