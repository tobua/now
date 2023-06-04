import { existsSync, readFileSync, rmSync } from 'fs'
import { join } from 'path'
import { stdin } from 'mock-stdin'
import { readChunkSync } from 'read-chunk'
import isPng from 'is-png'
import { test, expect, afterAll, beforeAll, afterEach } from 'vitest'
import { getTemplateDirectory } from '../utility/template-directory.js'
import { getConfig } from '../utility/get-config.js'
import { collectVariables } from '../utility/collect-variables.js'
import { writeFiles } from '../utility/write-files.js'

let io = null
beforeAll(() => {
  io = stdin()
})
afterAll(() => io.restore())

const destination = join(process.cwd(), '.jest-temp')

afterEach(() => {
  rmSync(destination, { recursive: true })
})

const keys = {
  down: '\x1B\x5B\x42',
  enter: '\x0D',
}

test('No variables collected without template.json file.', async () => {
  const templateDirectory = await getTemplateDirectory(
    undefined,
    undefined,
    join(process.cwd(), 'test/fixture/basic')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeTruthy()

  const contents = readFileSync(join(destination, 'index.js'), 'utf8')

  expect(contents).toEqual(`console.log('test')\n`)
})

test('Static variables from template.json are written.', async () => {
  const templateDirectory = await getTemplateDirectory(
    'static',
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeFalsy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contents = readFileSync(join(destination, 'index.ts'), 'utf8')

  expect(contents).toEqual(`console.log('static-variable')\n`)
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
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contents = readFileSync(join(destination, 'index.ts'), 'utf8')

  expect(contents).toEqual(`console.log('first second')\n`)
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
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config)
  writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'deep/package.json'))).toBeTruthy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contentsRoot = readFileSync(join(destination, 'package.json'), 'utf8')
  const contentsNested = readFileSync(join(destination, 'deep/package.json'), 'utf8')

  const expectedContents = `{\n    "name": "first",\n    "description": "second",\n    "version": "1.0.0"\n}`

  expect(contentsRoot).toEqual(expectedContents)
  expect(contentsNested).toEqual(expectedContents)
})

test('Specific files can be excluded from transform.', async () => {
  const templateDirectory = await getTemplateDirectory(
    'exclude-transform',
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)

  expect(config.excludeTransform).toEqual(['excluded.ts'])

  const variables = await collectVariables(config)

  writeFiles(destination, variables, templateDirectory, config)

  expect(existsSync(join(destination, 'index.tsx'))).toBeTruthy()
  expect(existsSync(join(destination, 'excluded.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeFalsy()
  expect(existsSync(join(destination, 'template.json'))).toBeFalsy()

  const contents = readFileSync(join(destination, 'index.tsx'), 'utf8')
  const contentsExcluded = readFileSync(join(destination, 'excluded.ts'), 'utf8')

  expect(contents).toEqual(`console.log('name description')\n`)
  expect(contentsExcluded).toEqual(`console.log('<%= keep.this %> name')\n`)
})

test('Non text files will stay intact when copied.', async () => {
  const templateDirectory = await getTemplateDirectory(
    'image',
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  writeFiles(destination, {}, templateDirectory, {})

  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()
  expect(existsSync(join(destination, 'logo.png'))).toBeTruthy()
  expect(existsSync(join(destination, 'logo-invalid.png'))).toBeTruthy()
  expect(existsSync(join(destination, 'nested/logo.png'))).toBeTruthy()
  expect(existsSync(join(destination, 'nested/logo-invalid.png'))).toBeTruthy()
  expect(existsSync(join(destination, 'index.js'))).toBeFalsy()

  const isValidImage = (fileName) =>
    isPng(
      readChunkSync(join(destination, fileName), {
        length: 8,
        startPosition: 0,
      })
    )

  expect(isValidImage('logo.png')).toBeTruthy()
  expect(isValidImage('logo-invalid.png')).toBeFalsy()
  expect(isValidImage('nested/logo.png')).toBeTruthy()
  expect(isValidImage('nested/logo-invalid.png')).toBeFalsy()
})

test(`Doesn't prompt for variables provided as cli arguments.`, async () => {
  const templateDirectory = await getTemplateDirectory(
    'dynamic',
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config, ['name=test', 'description=Hello again.'])
  writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()

  const contents = readFileSync(join(destination, 'index.ts'), 'utf8')

  expect(contents).toEqual(`console.log('test Hello again.')\n`)
})

test(`Doesn't prompt for variables provided as object.`, async () => {
  const templateDirectory = await getTemplateDirectory(
    'dynamic',
    undefined,
    join(process.cwd(), 'test/fixture/variable')
  )
  const config = getConfig(templateDirectory)
  const variables = await collectVariables(config, { name: 'test', description: 'Hello again.' })
  writeFiles(destination, variables, templateDirectory)

  expect(existsSync(join(destination, 'index.ts'))).toBeTruthy()

  const contents = readFileSync(join(destination, 'index.ts'), 'utf8')

  expect(contents).toEqual(`console.log('test Hello again.')\n`)
})
