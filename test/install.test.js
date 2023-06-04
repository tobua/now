import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { test, expect } from 'vitest'
import { getTemplateDirectory } from '../utility/template-directory.js'
import { getConfig } from '../utility/get-config.js'
import { installDependencies } from '../utility/install-dependencies.js'
import { writeFiles } from '../utility/write-files.js'

test('Dependencies are installed if there are any.', async () => {
  const destination = join(process.cwd(), '.jest-temp-dependencies')
  const templateDirectory = await getTemplateDirectory(
    undefined,
    undefined,
    join(process.cwd(), 'test/fixture/dependencies')
  )
  const config = getConfig(templateDirectory)
  writeFiles(destination, {}, templateDirectory)
  installDependencies(config, destination)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'package-lock.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'node_modules/react'))).toBeTruthy()

  rmSync(destination, { recursive: true })
})

test('Nothing installed if noInstall option is truthy.', async () => {
  const destination = join(process.cwd(), '.jest-temp-no-install')
  const templateDirectory = await getTemplateDirectory(
    undefined,
    undefined,
    join(process.cwd(), 'test/fixture/no-install')
  )
  const config = getConfig(templateDirectory)
  writeFiles(destination, {}, templateDirectory)
  installDependencies(config, destination)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'package-lock.json'))).toBeFalsy()
  expect(existsSync(join(destination, 'node_modules/react'))).toBeFalsy()

  rmSync(destination, { recursive: true })
})
