import prompts from 'prompts'
import { log } from './log.js'

export const promptDirectories = async (directories) => {
  const response = await prompts({
    type: 'select',
    name: 'directory',
    message: 'Which template would you like?',
    choices: directories.map((directory) => ({
      title: directory,
      value: directory,
    })),
  })

  return response.directory
}

export const promptVariables = async (inputPrompts) => {
  let valid = true

  inputPrompts.forEach((prompt) => {
    if (!prompt.type) {
      // eslint-disable-next-line no-param-reassign
      prompt.type = 'text'
    }

    if (!prompt.name) {
      log('Every prompt needs a name', 'error')
      valid = false
    }

    if (!prompt.message) {
      // eslint-disable-next-line no-param-reassign
      prompt.message = `Value for "${prompt.name}"?`
    }
  })

  if (!valid) {
    return false
  }

  const response = await prompts(inputPrompts)

  // eslint-disable-next-line no-console
  console.log('')

  return response
}

export const promptClear = async (directory) => {
  const response = await prompts({
    type: 'confirm',
    name: 'clear',
    message: `A directory ${directory} already exists, should it be overridden?`
  })

  return response.clear
}