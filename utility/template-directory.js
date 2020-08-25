import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import log from 'logua'
import { promptDirectories } from './prompt.js'
import { gitStorePathAbsolute } from '../config.js'

// singleTemplate: is there only one template available.
// directories: all the available templates.
// template: optional template the user has already selected.
const selectDirectory = async (singleTemplate, directories, template) => {
  if (singleTemplate) {
    return '.'
  }

  if (!directories.length) {
    log('No applicable templates found', 'error')
  }

  if (directories.length === 1) {
    if (!template || directories[0] === template) {
      return directories[0]
    }
    log(`The template "${template}" wasn't found in the package`, 'error')
  }

  if (template && directories.includes(template)) {
    return template
  }

  if (template && !directories.includes(template)) {
    log(`The template "${template}" wasn't found in the package`, 'error')
  }

  // If user has not selected a template but there is a default template, then use this one.
  if (directories.includes('default')) {
    return 'default'
  }

  return promptDirectories(directories)
}

export const getTemplateDirectory = async (
  template,
  templatesPath = join(gitStorePathAbsolute, 'template')
) => {
  if (!existsSync(templatesPath)) {
    log('Repository has no /template folder', 'error')
  }

  let singleTemplate = false

  const directories = readdirSync(templatesPath, { withFileTypes: true })
    .filter((path) => {
      if (!path.isDirectory()) {
        singleTemplate = true
        return false
      }

      return true
    })
    .map((path) => path.name)

  const directory = await selectDirectory(singleTemplate, directories, template)

  return join(templatesPath, directory)
}
