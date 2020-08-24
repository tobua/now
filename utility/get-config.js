import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { log } from './log.js'

export const getConfig = (templateDirectory) => {
  const configFilePath = join(templateDirectory, 'template.json')
  let config = {}

  if (existsSync(configFilePath)) {
    try {
      config = JSON.parse(readFileSync(configFilePath, 'utf8'))
    } catch (error) {
      log(`Couldn't read configuration file in ${configFilePath}`, 'error')
    }
  }

  return config
}
