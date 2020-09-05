import { mkdirSync, lstatSync, existsSync } from 'fs'
import { join } from 'path'
import rimraf from 'rimraf'
import validate from 'validate-npm-package-name'
import { gitStorePath } from '../config.js'
import { log } from './log.js'

export const getDestinationPath = (input) => {
  let destinationPath = process.cwd()

  if (input) {
    destinationPath = join(process.cwd(), input)
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

export const cleanup = () => {
  rimraf.sync(gitStorePath)
}
