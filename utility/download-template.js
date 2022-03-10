import download from 'download-git-repo'
import { log } from './log.js'

const attemptDownload = (url, cachePath, callback) => download(url, cachePath, callback)

export const downloadTemplate = async (url, cachePath) =>
  new Promise((done) => {
    attemptDownload(url, cachePath, (error) => {
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
