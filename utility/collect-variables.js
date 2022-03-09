import { promptVariables } from './prompt.js'

export const collectVariables = async (config, variableArguments) => {
  const variables = {}

  if (config.variables) {
    Object.assign(variables, config.variables)
  }

  if (Array.isArray(variableArguments)) {
    variableArguments.forEach((variableArgument) => {
      const [property, value] = variableArgument.split('=')
      variables[property] = value

      if (config.prompts && Array.isArray(config.prompts)) {
        config.prompts = config.prompts.filter((prompt) => prompt.name !== property)
      }
    })
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
