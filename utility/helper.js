import { mkdirSync, lstatSync, existsSync, rmSync, readdirSync } from 'fs'
import { join, isAbsolute } from 'path'
import validate from 'validate-npm-package-name'
import { log } from './log.js'
import { promptClear } from './prompt.js'

const isDirectoryEmpty = (directory) => readdirSync(directory).length === 0

export const getDestinationPath = async (input = process.cwd(), skipClear = false) => {
  let destinationPath = process.cwd()

  if (input && !isAbsolute(input)) {
    destinationPath = join(process.cwd(), input)
  } else {
    destinationPath = input
  }

  if (!existsSync(destinationPath)) {
    mkdirSync(destinationPath, { recursive: true })
  } else if (!lstatSync(destinationPath).isDirectory()) {
    log(`Destination ${destinationPath} must be a directory`, 'error')
  } else if (!skipClear && !isDirectoryEmpty(destinationPath)) {
    const clear = await promptClear(destinationPath)

    if (!clear) {
      log('Keeping existing contents, might be overriden when copying the template')
    } else {
      // Clear directory to ensure proper npm install.
      rmSync(destinationPath, { recursive: true })
      // Directory itself is needed.
      mkdirSync(destinationPath, { recursive: true })
    }
  }

  return destinationPath
}

export const validatePackageName = (packageName) => {
  if (!packageName || !(typeof packageName === 'string')) {
    log('Please provide a valid package name', 'error')
  }

  if (!validate(packageName).validForOldPackages) {
    log(`${packageName} is not a valid package name`, 'error')
  }

  return packageName
}

export const cleanup = (cachePath) =>
  existsSync(cachePath) && rmSync(cachePath, { recursive: true })
