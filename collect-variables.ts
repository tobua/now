import { promptVariables } from './prompt'
import type { Config } from './types'

const removePropertyFromPrompts = (config: Config, property: string) => {
  if (config.prompts && Array.isArray(config.prompts)) {
    config.prompts = config.prompts.filter((prompt) => prompt.name !== property)
  }
}

export const collectVariables = async (config: Config, variableArguments?: object) => {
  const variables = {}

  if (config.variables) {
    Object.assign(variables, config.variables)
  }

  if (Array.isArray(variableArguments)) {
    for (const variableArgument of variableArguments) {
      const [property, value] = variableArgument.split('=')
      // @ts-ignore
      variables[property] = value
      removePropertyFromPrompts(config, property)
    }
  } else if (variableArguments && typeof variableArguments === 'object') {
    Object.assign(variables, variableArguments)
    for (const property of Object.keys(variableArguments)) {
      removePropertyFromPrompts(config, property)
    }
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
