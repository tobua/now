import { mkdirSync, lstatSync, existsSync } from 'fs'
import { join } from 'path'
import validate from 'validate-npm-package-name'
import { log } from './log.js'

export const getDestinationPath = (input) => {
    let destinationPath = process.cwd()

    if (input) {
        destinationPath = join(process.cwd(), input)
    }

    // TODO for testing
    destinationPath = join(process.cwd(), 'result')

    if (!existsSync(destinationPath)){
        mkdirSync(destinationPath);
    } else {
        if (!lstatSync(destinationPath).isDirectory()) {
            log(`Destination ${destinationPath} must be a directory`, 'error')
        }
    }

    return destinationPath
}

export const validatePackageName = (packageName) => {
    if (!packageName || !(typeof packageName === 'string')) {
        log('Please provide a valid package name', 'error')
        process.exit(0)
    }

    if (!validate(packageName).validForOldPackages) {
        log(`${packageName} is not a valid package name`, 'error')
        process.exit(0)
    }

    return packageName
}