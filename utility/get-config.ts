import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Config } from '../types'
import { log } from './log'

export const getConfig = (templateDirectory: string) => {
  const configFilePath = join(templateDirectory, 'template.json')
  let config: Config = {}

  if (existsSync(configFilePath)) {
    try {
      config = JSON.parse(readFileSync(configFilePath, 'utf8'))
    } catch (_error) {
      log(`Couldn't read configuration file in ${configFilePath}`, 'error')
    }
  }

  return config
}
