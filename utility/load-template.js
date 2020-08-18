import { existsSync } from 'fs'
import { join } from 'path'
import download from 'download-git-repo'
import rimraf from 'rimraf'
import { log } from './log.js'

export const loadTemplate = async (url, template) => {
  const gitStorePath = '.create-now-temporary'
  const gitStorePathAbsolute = join(process.cwd(), gitStorePath)

  rimraf.sync(gitStorePath)

  await new Promise((done) => {
    download(url, gitStorePathAbsolute, (error) => {
      if (error) {
        log(`Couldn't download repository from ${url}`)
        process.exit(0)
      }

      done()
    })
  })

  const templatePath = join(gitStorePathAbsolute, 'template')

  if (!existsSync(templatePath)) {
    log('Repository has no /template folder', 'error')
    process.exit(0)
  }

  console.log('checkout done', gitStorePath)
  // rimraf.sync(gitStorePath)
}
