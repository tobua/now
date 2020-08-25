import log from 'logua'
import {
  getDestinationPath,
  validatePackageName,
  cleanup,
} from '../utility/helper.js'
import { loadPackage } from '../utility/load-package.js'
import { downloadTemplate } from '../utility/download-template.js'
import { getTemplateDirectory } from '../utility/template-directory.js'
import { collectVariables } from '../utility/collect-variables.js'
import { writeFiles } from '../utility/write-files.js'
import { installDependencies } from '../utility/install-dependencies.js'
import { getConfig } from '../utility/get-config.js'

export const create = async (packageName, destinationPath, template) => {
  validatePackageName(packageName)
  const destination = getDestinationPath(destinationPath)

  cleanup()

  const url = await loadPackage(packageName)
  await downloadTemplate(url)
  const templateDirectory = await getTemplateDirectory(template)
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  await writeFiles(destination, variables, templateDirectory)
  installDependencies(config, destination)

  cleanup()

  log(`Done, project created in ${destination}`)
}
