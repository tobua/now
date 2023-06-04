import { mkdirSync, lstatSync, existsSync, rmSync } from 'fs'
import { join, isAbsolute } from 'path'
import validate from 'validate-npm-package-name'
import { log } from './log.js'

export const getDestinationPath = (input = process.cwd()) => {
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
