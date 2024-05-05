import { existsSync, lstatSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { log } from './log'
import { promptDirectories } from './prompt'

// singleTemplate: is there only one template available.
// directories: all the available templates.
// template: optional template the user has already selected.
const selectDirectory = (singleTemplate: boolean, directories: string[], template: string) => {
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

function findFirstFolder(folder: string) {
  if (!folder) {
    return ''
  }
  const files = readdirSync(folder)
  let result = ''

  for (const file of files) {
    const filePath = join(folder, file)

    if (lstatSync(filePath).isDirectory()) {
      result = basename(filePath)
      break
    }
  }

  return result
}

export const getTemplateDirectory = async (template = '', cachePath = '', pathOverride?: string) => {
  const containingFolder = findFirstFolder(cachePath)
  const templatesPath = pathOverride || join(cachePath, containingFolder, 'template')

  if (!existsSync(templatesPath)) {
    log('Repository has no /template folder', 'error')
  }

  let singleTemplate = false

  const directories = readdirSync(templatesPath, { withFileTypes: true })
    .filter((path) => {
      if (!path.isDirectory()) {
        // Adding a README file is fine.
        if (path.name.toLowerCase() !== 'readme.md') {
          singleTemplate = true
        }
        return false
      }

      return true
    })
    .map((path) => path.name)

  const directory = await selectDirectory(singleTemplate, directories, template)

  return join(templatesPath, directory)
}
