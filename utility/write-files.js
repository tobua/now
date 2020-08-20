import { readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import ejs from 'ejs'
import { log } from './log.js'

export const writeFiles = (destinationPath, variables, templateDirectory) => {
  readdirSync(templateDirectory, { withFileTypes: true }).forEach((path) => {
    if (path.isDirectory()) {
      return
    }

    ejs.renderFile(
      join(templateDirectory, path.name),
      variables,
      {},
      (error, result) => {
        if (error) {
          log(`Error rendering template for ${path.name}`, 'error')
        }

        writeFileSync(join(destinationPath, path.name), result)
      }
    )
  })
}
