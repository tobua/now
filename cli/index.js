#!/usr/bin/env node

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
import { log } from '../utility/log.js'

const packageName = validatePackageName(process.argv.slice(2)[0])
const destination = getDestinationPath(process.argv.slice(2)[1])
const template = process.argv.slice(2)[2] || 'default'

;(async () => {
  cleanup()

  const url = await loadPackage(packageName)
  await downloadTemplate(url)
  const templateDirectory = await getTemplateDirectory(template)
  const variables = await collectVariables(templateDirectory)
  await writeFiles(destination, variables, templateDirectory)

  cleanup()

  log(`Done, project created in ${destination}`)
})()
