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

export const create = async (packageName: string, destinationPath?: string, template = 'default', variableArguments?: object) => {
  validatePackageName(packageName)
  const destination = await getDestinationPath(destinationPath)
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
}
