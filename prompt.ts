import prompts from 'prompts'
import { log } from './log'
import type { Config } from './types'

export const promptDirectories = async (directories: string[]) => {
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

export const promptVariables = async (inputPrompts: Config['prompts'] = []) => {
  let valid = true

  for (const prompt of inputPrompts) {
    if (!prompt.type) {
      prompt.type = 'text'
    }

    if (!prompt.name) {
      log('Every prompt needs a name', 'error')
      valid = false
    }

    if (!prompt.message) {
      prompt.message = `Value for "${prompt.name}"?`
    }
  }

  if (!valid) {
    return false
  }

  const response = await prompts(inputPrompts)

  // biome-ignore lint/suspicious/noConsoleLog: Used to add a single line.
  console.log('')

  return response
}

export const promptClear = async (directory: string) => {
  const response = await prompts({
    type: 'confirm',
    name: 'clear',
    message: `A directory ${directory} already exists, should it be emptied first?`,
  })

  return response.clear
}
