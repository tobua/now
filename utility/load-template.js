import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import download from 'download-git-repo'
import rimraf from 'rimraf'
import ejs from 'ejs'
import { log } from './log.js'
import { promptDirectories, promptVariables } from './prompt.js'

export const loadTemplate = async (url, template, destinationPath) => {
  const gitStorePath = '.create-now-temporary'
  const gitStorePathAbsolute = join(process.cwd(), gitStorePath)

  rimraf.sync(gitStorePath)

  await new Promise((done) => {
    download(url, gitStorePathAbsolute, (error) => {
      if (error) {
        log(`Couldn't download repository from ${url}`, 'error')
      }

      done()
    })
  })

  const templatePath = join(gitStorePathAbsolute, 'template')

  if (!existsSync(templatePath)) {
    log('Repository has no /template folder', 'error')
  }

  let singleTemplate = false

  const directories = readdirSync(templatePath, { withFileTypes: true })
    .filter(path => {
      if (!path.isDirectory()) {
        singleTemplate = true
        return false
      } else {
        return true
      }
    })
    .map(path => path.name)

  let directory

  if (!singleTemplate && directories.length > 1) {
    directory = promptDirectories(directories)
  } else {
    if (singleTemplate) {
      directory = '.'
    } else {
      directory = directories[0]
    }
  }

  const absoluteDirectory = join(templatePath, directory)
  const configFilePath = join(absoluteDirectory, 'template.json')
  let config = {}
  let variables = {}

  if (existsSync(configFilePath)) {
    try {
      config = JSON.parse(readFileSync(configFilePath, 'utf8'))
      unlinkSync(configFilePath)
    } catch(error) {
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

  readdirSync(absoluteDirectory, { withFileTypes: true })
    .forEach(path => {
      if (path.isDirectory()) {
        return
      }

      ejs.renderFile(join(absoluteDirectory, path.name), variables, {}, (error, result) => {
        if (error) {
          log(`Error rendering template for ${path.name}`, 'error')
        }

        writeFileSync(join(destinationPath, path.name), result)
      })
    })

  rimraf.sync(gitStorePath)
}
