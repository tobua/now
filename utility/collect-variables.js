import { promptVariables } from './prompt.js'

export const collectVariables = async (config) => {
  const variables = {}

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
