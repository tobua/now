const { existsSync } = require('fs')
const { join } = require('path')
const rimraf = require('rimraf')
const { getTemplateDirectory } = require('../utility/template-directory.js')
const { getConfig } = require('../utility/get-config.js')
const { installDependencies } = require('../utility/install-dependencies.js')
const { writeFiles } = require('../utility/write-files.js')

jest.setTimeout(50000)

test('Dependencies are installed if there are any.', async () => {
  const destination = join(process.cwd(), '.jest-temp-dependencies')
  const templateDirectory = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/dependencies')
  )
  const config = getConfig(templateDirectory)
  await writeFiles(destination, {}, templateDirectory)
  installDependencies(config, destination)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'package-lock.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'node_modules/react'))).toBeTruthy()

  rimraf.sync(destination)
})

test('Nothing installed if noInstall option is truthy.', async () => {
  const destination = join(process.cwd(), '.jest-temp-no-install')
  const templateDirectory = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/no-install')
  )
  const config = getConfig(templateDirectory)
  await writeFiles(destination, {}, templateDirectory)
  installDependencies(config, destination)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'package-lock.json'))).toBeFalsy()
  expect(existsSync(join(destination, 'node_modules/react'))).toBeFalsy()

  rimraf.sync(destination)
})
