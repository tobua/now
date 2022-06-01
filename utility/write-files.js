import { readdirSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'
import ejs from 'ejs'
import { isBinaryFileSync } from 'isbinaryfile'
import { log } from './log.js'

const writeDirectoryFiles = (
  directory,
  variables,
  destinationPath,
  relativePath = '.',
  config = {}
) => {
  readdirSync(directory, { withFileTypes: true }).forEach((path) => {
    const ejsOptions = {}

    if (path.isDirectory()) {
      // Recursively check subfolders.
      writeDirectoryFiles(
        join(directory, path.name),
        variables,
        destinationPath,
        join(relativePath, path.name),
        config
      )
      return
    }

    // Skip config file.
    if (path.name === 'template.json') {
      return
    }

    if ((config.excludeTransform || []).includes(path.name)) {
      ejsOptions.delimiter = '#'
    }

    const currentDestinationPath = join(destinationPath, relativePath)

    if (!existsSync(currentDestinationPath)) {
      mkdirSync(currentDestinationPath, { recursive: true })
    }

    // Do not add variables to binary files like images.
    if (isBinaryFileSync(join(directory, path.name))) {
      copyFileSync(join(directory, path.name), join(currentDestinationPath, path.name))
      return
    }

    ejs.renderFile(join(directory, path.name), variables, ejsOptions, (error, result) => {
      if (error) {
        log(`Error rendering template for ${path.name}`, 'error')
      }

      writeFileSync(join(currentDestinationPath, path.name), result)
    })
  })
}

export const writeFiles = (destinationPath, variables, templateDirectory, config) => {
  // Ensure destination directory exists.
  if (!existsSync(destinationPath)) {
    mkdirSync(destinationPath)
  }

  writeDirectoryFiles(templateDirectory, variables, destinationPath, '.', config)
}
