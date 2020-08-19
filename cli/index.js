#!/usr/bin/env node

import { getDestinationPath, validatePackageName } from '../utility/helper.js'
import { loadPackage } from '../utility/load-package.js'
import { loadTemplate } from '../utility/load-template.js'
import { log } from '../utility/log.js'

let packageName = validatePackageName(process.argv.slice(2)[0])
let destinationPath = getDestinationPath(process.argv.slice(2)[1])
let template = process.argv.slice(2)[2] || 'default'

;(async () => {
  const url = await loadPackage(packageName)
  await loadTemplate(url, template, destinationPath)

  log(`Done, project created in ${destinationPath}`)
})()
