import { getDestinationPath, validatePackageName } from '../utility/helper.js'
import { loadPackage } from '../utility/load-package.js'
import { loadTemplate } from '../utility/load-template.js'
import { log } from '../utility/log.js'

export const template = async (packageName, template = 'default', destinationPath) => {
  validatePackageName(packageName)
  destinationPath = getDestinationPath(process.argv.slice(2)[2])

  const url = await loadPackage(packageName)
  await loadTemplate(url, template, destinationPath)

  log(`Done, project created in ${destinationPath}`)
}
