#!/usr/bin/env node

import { loadPackage } from '../utility/load-package.js'
import { loadTemplate } from '../utility/load-template.js'

let packageName = process.argv.slice(2)[0]
let template = process.argv.slice(2)[1] || 'default'
let destinationPath = process.argv.slice(2)[2] || '.'

console.log(packageName, template, destinationPath)
;(async () => {
  console.log('async')
  const url = await loadPackage(packageName)

  console.log(url)
  await loadTemplate(url, template)
})()
