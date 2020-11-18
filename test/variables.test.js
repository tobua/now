const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const { stdin } = require('mock-stdin')
const rimraf = require('rimraf')
const { getTemplateDirectory } = require('../utility/template-directory.js')
const { getConfig } = require('../utility/get-config.js')
const { collectVariables } = require('../utility/collect-variables.js')
const { writeFiles } = require('../utility/write-files.js')

jest.setTimeout(30000)

let io = null
beforeAll(() => {
  io = stdin()
})
afterAll(() => io.restore())

const keys = {
  down: '\x1B\x5B\x42',
  enter: '\x0D',
}

const destination = join(process.cwd(), '.jest-temp')

test('No variables collected without template.json file.', async () => {
  const templateDirectory = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/basic')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  await writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeTruthy()

  const contents = readFileSync(join(destination, 'index.js'), 'utf8')

  expect(contents).toEqual(`console.log('test')\n`)

  rimraf.sync(destination)
})

test('Static variables from template.json are written.', async () => {
  const templateDirectory = await getTemplateDirectory(
    'static',
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  await writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeFalsy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contents = readFileSync(join(destination, 'index.ts'), 'utf8')

  expect(contents).toEqual(`console.log('static-variable')\n`)

  rimraf.sync(destination)
})

test('Dynamic variables from template.json are prompted and written.', async () => {
  // Mocks entering of dynamic variables.
  const sendKeystrokesFirstVariable = async () => {
    io.send('first', 'ascii')
    io.send(keys.enter)
  }

  const sendKeystrokesSecondVariable = async () => {
    io.send('second', 'ascii')
    io.send(keys.enter)
  }

  setTimeout(() => sendKeystrokesFirstVariable().then(), 5)
  setTimeout(() => sendKeystrokesSecondVariable().then(), 10)

  const templateDirectory = await getTemplateDirectory(
    'dynamic',
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  await writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contents = readFileSync(join(destination, 'index.ts'), 'utf8')

  expect(contents).toEqual(`console.log('first second')\n`)

  rimraf.sync(destination)
})

test('Nested files are written as well and static, dynamic variables can be combined.', async () => {
  // Mocks entering of dynamic variables.
  const sendKeystrokesFirstVariable = async () => {
    io.send('first', 'ascii')
    io.send(keys.enter)
  }

  const sendKeystrokesSecondVariable = async () => {
    io.send('second', 'ascii')
    io.send(keys.enter)
  }

  setTimeout(() => sendKeystrokesFirstVariable().then(), 5)
  setTimeout(() => sendKeystrokesSecondVariable().then(), 10)

  const templateDirectory = await getTemplateDirectory(
    'nested',
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  await writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'deep/package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contentsRoot = readFileSync(join(destination, 'package.json'), 'utf8')
  const contentsNested = readFileSync(
    join(destination, 'deep/package.json'),
    'utf8'
  )

  const expectedContents = `{\n    "name": "first",\n    "description": "second",\n    "version": "1.0.0"\n}`

  expect(contentsRoot).toEqual(expectedContents)
  expect(contentsNested).toEqual(expectedContents)

  rimraf.sync(destination)
})

test('Specific files can be excluded from transform.', async () => {
  const templateDirectory = await getTemplateDirectory(
    'exclude-transform',
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)

  expect(config.excludeTransform).toEqual(['excluded.ts'])

  const variables = await collectVariables(config)

  await writeFiles(destination, variables, templateDirectory, config)

  expect(existsSync(join(destination, 'index.tsx'))).toBeTruthy()
  expect(existsSync(join(destination, 'excluded.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeFalsy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contents = readFileSync(join(destination, 'index.tsx'), 'utf8')
  const contentsExcluded = readFileSync(
    join(destination, 'excluded.ts'),
    'utf8'
  )

  expect(contents).toEqual(`console.log('name description')\n`)
  expect(contentsExcluded).toEqual(`console.log('<%= keep.this %> name')\n`)

  rimraf.sync(destination)
})
