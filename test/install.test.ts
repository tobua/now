import { expect, test } from 'bun:test'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { getConfig } from '../utility/get-config'
import { installDependencies } from '../utility/install-dependencies'
import { getTemplateDirectory } from '../utility/template-directory'
import { writeFiles } from '../utility/write-files'

test('Dependencies are installed if there are any.', async () => {
  const destination = join(process.cwd(), '.jest-temp-dependencies')
  const templateDirectory = await getTemplateDirectory(undefined, undefined, join(process.cwd(), 'test/fixture/dependencies'))
  const config = getConfig(templateDirectory)
  writeFiles(destination, {}, templateDirectory)
  installDependencies(config, destination)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'bun.lockb'))).toBeTruthy()
  expect(existsSync(join(destination, 'node_modules/react'))).toBeTruthy()

  rmSync(destination, { recursive: true })
}, 20000)

test('Nothing installed if noInstall option is truthy.', async () => {
  const destination = join(process.cwd(), '.jest-temp-no-install')
  const templateDirectory = await getTemplateDirectory(undefined, undefined, join(process.cwd(), 'test/fixture/no-install'))
  const config = getConfig(templateDirectory)
  writeFiles(destination, {}, templateDirectory)
  installDependencies(config, destination)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'bun.lockb'))).toBeFalsy()
  expect(existsSync(join(destination, 'node_modules/react'))).toBeFalsy()

  rmSync(destination, { recursive: true })
}, 20000)
