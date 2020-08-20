import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { log } from './log.js'
import { promptDirectories } from './prompt.js'
import { gitStorePathAbsolute } from '../config.js'

export const getTemplateDirectory = async (template) => {
  const templatePath = join(gitStorePathAbsolute, 'template')

  if (!existsSync(templatePath)) {
    log('Repository has no /template folder', 'error')
  }

  let singleTemplate = false

  // TODO fail programmatic if several templates available, but none selected.

  const directories = readdirSync(templatePath, { withFileTypes: true })
    .filter((path) => {
      if (!path.isDirectory()) {
        singleTemplate = true
        return false
      }

      return true
    })
    .map((path) => path.name)

  let directory

  if (!singleTemplate && directories.length > 1) {
    directory = await promptDirectories(directories)
  } else if (singleTemplate) {
    directory = '.'
  } else {
    ;[directory] = directories
  }

  return join(templatePath, directory)
}
