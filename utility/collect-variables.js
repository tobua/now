import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { promptVariables } from './prompt.js'
import { log } from './log.js'

export const collectVariables = async (templateDirectory) => {
  const configFilePath = join(templateDirectory, 'template.json')
  let config = {}
  const variables = {}

  if (existsSync(configFilePath)) {
    try {
      config = JSON.parse(readFileSync(configFilePath, 'utf8'))
    } catch (error) {
      log(`Couldn't read configuration file in ${configFilePath}`, 'error')
    }
  }

  if (config.variables) {
    Object.assign(variables, config.variables)
  }

  if (config.prompts && config.prompts.length > 0) {
    const promptResult = await promptVariables(config.prompts)

    if (!promptResult) {
      process.exit(0)
    }

    Object.assign(variables, promptResult)
  }

  return variables
}
