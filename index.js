import { getDestinationPath, validatePackageName } from '../utility/helper.js'
import { loadPackage } from '../utility/load-package.js'
import { loadTemplate } from '../utility/load-template.js'
import { log } from '../utility/log.js'

export const create = async (
  packageName,
  destinationPath,
  template = 'default'
) => {
  validatePackageName(packageName)
  const destination = getDestinationPath(destinationPath)

  const url = await loadPackage(packageName)
  await loadTemplate(url, template, destination)

  log(`Done, project created in ${destination}`)
}
