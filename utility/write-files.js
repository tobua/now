import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import ejs from 'ejs'
import log from 'logua'

const writeDirectoryFiles = (
  directory,
  variables,
  destinationPath,
  relativePath = '.'
) => {
  readdirSync(directory, { withFileTypes: true }).forEach((path) => {
    if (path.isDirectory()) {
      // Recursively check subfolders.
      writeDirectoryFiles(
        join(directory, path.name),
        variables,
        destinationPath,
        join(relativePath, path.name)
      )
      return
    }

    // Skip config file.
    if (path.name === 'template.json') {
      return
    }

    ejs.renderFile(
      join(directory, path.name),
      variables,
      {},
      (error, result) => {
        if (error) {
          log(`Error rendering template for ${path.name}`, 'error')
        }

        const currentDestinationPath = join(destinationPath, relativePath)

        if (!existsSync(currentDestinationPath)) {
          mkdirSync(currentDestinationPath)
        }

        writeFileSync(join(currentDestinationPath, path.name), result)
      }
    )
  })
}

export const writeFiles = (destinationPath, variables, templateDirectory) => {
  // Ensure destination directory exists.
  if (!existsSync(destinationPath)) {
    mkdirSync(destinationPath)
  }

  writeDirectoryFiles(templateDirectory, variables, destinationPath)
}
