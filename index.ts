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
