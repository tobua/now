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

export const create = async (
  packageName,
  destinationPath,
  template = 'default',
  variableArguments = null
) => {
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
