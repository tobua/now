import download from 'download-git-repo'
import { log } from './log.js'
import { gitStorePathAbsolute } from '../config.js'

export const downloadTemplate = async (url) => {
  await new Promise((done) => {
    download(url, gitStorePathAbsolute, (error) => {
      if (error) {
        log(`Couldn't download repository from ${url}`, 'error')
      }

      done()
    })
  })
}
