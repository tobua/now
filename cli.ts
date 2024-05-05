#!/usr/bin/env bun
import { collectVariables } from './collect-variables'
import { cachePath } from './config'
import { downloadTemplate } from './download-template'
import { getConfig } from './get-config'
import { cleanup, getDestinationPath, validatePackageName } from './helper'
import { installDependencies } from './install-dependencies'
import { loadPackage } from './load-package'
import { log } from './log'
import { getTemplateDirectory } from './template-directory'
import { writeFiles } from './write-files'

// Remove additional parameter when used with flag like --yes in older node versions.
if (process.argv[2] === 'now') {
  process.argv.splice(2, 1)
}
// eslint-disable-next-line prefer-const
let [packageName, destination, template = 'default', ...variableArguments] = process.argv.slice(2)

packageName = validatePackageName(packageName)
destination = await getDestinationPath(destination)
const cache = cachePath(`${packageName}-${template}`)

cleanup(cache)

const url = await loadPackage(packageName as string)
await downloadTemplate(url, cache)
const templateDirectory = await getTemplateDirectory(template, cache)
const config = getConfig(templateDirectory)
const variables = await collectVariables(config, variableArguments)
writeFiles(destination, variables, templateDirectory, config)
installDependencies(config, destination)

cleanup(cache)

log(`Done, project created in ${destination}`)
