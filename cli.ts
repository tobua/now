#!/usr/bin/env bun
import { cachePath } from './config'
import { collectVariables } from './utility/collect-variables'
import { downloadTemplate } from './utility/download-template'
import { getConfig } from './utility/get-config'
import { cleanup, getDestinationPath, validatePackageName } from './utility/helper'
import { installDependencies } from './utility/install-dependencies'
import { loadPackage } from './utility/load-package'
import { log } from './utility/log'
import { getTemplateDirectory } from './utility/template-directory'
import { writeFiles } from './utility/write-files'

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
