import { existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import validate from 'validate-npm-package-name'
import { log } from './log'
import { promptClear } from './prompt'

function deleteFolderContents(directory: string) {
  for (const file of readdirSync(directory)) {
    rmSync(join(directory, file), { recursive: true })
  }
}

const isDirectoryEmpty = (directory: string) => readdirSync(directory).filter((file: string) => file !== '.DS_Store').length === 0

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
  } else if (!(skipClear || isDirectoryEmpty(destinationPath))) {
    const clear = await promptClear(destinationPath)

    if (clear) {
      // Clear directory contents to ensure proper template installation.
      deleteFolderContents(destinationPath)
    } else {
      log('Keeping existing contents, might be overriden when copying the template')
    }
  }

  return destinationPath
}

export const validatePackageName = (packageName?: string) => {
  if (!(packageName && typeof packageName === 'string')) {
    log('Please provide a valid package name', 'error')
  }

  if (!validate(packageName as string).validForOldPackages) {
    log(`${packageName} is not a valid package name`, 'error')
  }

  return packageName
}

export const cleanup = (cachePath: string) => existsSync(cachePath) && rmSync(cachePath, { recursive: true })
