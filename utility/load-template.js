import download from 'download-git-repo'
import { log } from './log.js'

export const loadTemplate = async (url, template) => {
  //

  await new Promise((done) => {
    download(url, 'download', (error) => {
      if (error) {
        log(`Couldn't download repository from ${url}.`)
      }

      done()
    })
  })

  //
}
