#!/usr/bin/env node
import { getDestinationPath, validatePackageName, cleanup } from './utility/helper.js'
import { loadPackage } from './utility/load-package.js'
import { downloadTemplate } from './utility/download-template.js'
import { getTemplateDirectory } from './utility/template-directory.js'
import { collectVariables } from './utility/collect-variables.js'
import { writeFiles } from './utility/write-files.js'
import { installDependencies } from './utility/install-dependencies.js'
import { getConfig } from './utility/get-config.js'
import { log } from './utility/log.js'
import { cachePath } from './config.js'

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

const url = await loadPackage(packageName)
await downloadTemplate(url, cache)
const templateDirectory = await getTemplateDirectory(template, cache)
const config = getConfig(templateDirectory)
const variables = await collectVariables(config, variableArguments)
writeFiles(destination, variables, templateDirectory, config)
installDependencies(config, destination)

cleanup(cache)

log(`Done, project created in ${destination}`)
