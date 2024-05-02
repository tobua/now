import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ejs from 'ejs'
import { isBinaryFileSync } from 'isbinaryfile'
import type { Config } from '../types'
import { log } from './log'

const writeDirectoryFiles = (
  directory: string,
  variables: Config['variables'],
  destinationPath: string,
  relativePath = '.',
  config: Config = {},
) => {
  const directoryEntries = readdirSync(directory, { withFileTypes: true })
  for (const path of directoryEntries) {
    const ejsOptions: ejs.Options = {}

    if (path.isDirectory()) {
      // Recursively check subfolders.
      writeDirectoryFiles(join(directory, path.name), variables, destinationPath, join(relativePath, path.name), config)
      continue
    }

    // Skip config file.
    if (path.name === 'template.json') {
      continue
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
      continue
    }

    ejs.renderFile(join(directory, path.name), variables ?? {}, ejsOptions, (error, result) => {
      if (error) {
        log(`Error rendering template for ${path.name}`, 'error')
      }

      writeFileSync(join(currentDestinationPath, path.name), result)
    })
  }
}

export const writeFiles = (destinationPath: string, variables: Config['variables'], templateDirectory: string, config?: Config) => {
  // Ensure destination directory exists.
  if (!existsSync(destinationPath)) {
    mkdirSync(destinationPath)
  }

  writeDirectoryFiles(templateDirectory, variables, destinationPath, '.', config)
}
