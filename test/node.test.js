import { mkdirSync } from 'fs'
import { join } from 'path'
import { listFilesMatching } from 'jest-fixture'
import rimraf from 'rimraf'
import { create } from '../index.js'

// Install can sometimes take long.
jest.setTimeout(120000)

const fixtureFolder = join(process.cwd(), 'test/download')

beforeEach(() => rimraf.sync(fixtureFolder))
afterEach(() => rimraf.sync(fixtureFolder))

test('Node API downloads and installs papua default package.', async () => {
  mkdirSync(fixtureFolder)

  await create('papua', fixtureFolder)

  const files = listFilesMatching('*', fixtureFolder)

  expect(files.length).toBe(5)
  expect(files).toContain('.gitignore')
  expect(files).toContain('index.js')
  expect(files).toContain('package.json')
  expect(files).toContain('jsconfig.json')
  expect(files).toContain('package-lock.json')
})

test('Node API downloads and installs papua typescript package.', async () => {
  mkdirSync(fixtureFolder)

  await create('papua', fixtureFolder, 'typescript')

  const files = listFilesMatching('*', fixtureFolder)

  expect(files.length).toBe(5)
  expect(files).toContain('.gitignore')
  expect(files).toContain('index.tsx')
  expect(files).toContain('package.json')
  expect(files).toContain('tsconfig.json')
  expect(files).toContain('package-lock.json')
})
