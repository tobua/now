import { promptVariables } from './prompt.js'

const removePropertyFromPrompts = (config, property) => {
  if (config.prompts && Array.isArray(config.prompts)) {
    config.prompts = config.prompts.filter((prompt) => prompt.name !== property)
  }
}

export const collectVariables = async (config, variableArguments) => {
  const variables = {}

  if (config.variables) {
    Object.assign(variables, config.variables)
  }

  if (Array.isArray(variableArguments)) {
    variableArguments.forEach((variableArgument) => {
      const [property, value] = variableArgument.split('=')
      variables[property] = value
      removePropertyFromPrompts(config, property)
    })
  } else if (variableArguments && typeof variableArguments === 'object') {
    Object.assign(variables, variableArguments)
    Object.keys(variableArguments).forEach((property) =>
      removePropertyFromPrompts(config, property)
    )
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
