// @ts-ignore
import download from 'download-git-repo'
import { log } from './log'

const attemptDownload = (url: string, cachePath: string, callback: (error: string) => void) => download(url, cachePath, callback)

export const downloadTemplate = async (url: string, cachePath: string) =>
  new Promise<void>((done) => {
    attemptDownload(url, cachePath, (error) => {
      if (error) {
        // Plugin defaults to master branch, on error reattempt with main branch.
        attemptDownload(`${url}#main`, cachePath, (secondError) => {
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
