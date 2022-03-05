import download from 'download-git-repo'
import { gitStorePathAbsolute } from '../config.js'
import { log } from './log.js'

const attemptDownload = (url, callback) => download(url, gitStorePathAbsolute, callback)

export const downloadTemplate = async (url) => {
  await new Promise((done) => {
    attemptDownload(url, (error) => {
      if (error) {
        // Plugin defaults to master branch, on error reattempt with main branch.
        attemptDownload(`${url}#main`, (secondError) => {
          if (secondError) {
            log(`Couldn't download repository from ${url}`, 'error')
          }
          done()
        })
      } else {
        done()
      }
    })
  })
}
