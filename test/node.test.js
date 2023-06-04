import { mkdirSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { test, expect, beforeAll, afterEach } from 'vitest'
import { listFilesMatching } from 'jest-fixture'
import { create } from '../index.js'

const fixtureFolder = join(process.cwd(), 'test/download')

beforeAll(() => existsSync(fixtureFolder) && rmSync(fixtureFolder, { recursive: true }))
afterEach(() => rmSync(fixtureFolder, { recursive: true }))

test('Node API downloads and installs papua default package.', async () => {
  mkdirSync(fixtureFolder)

  await create('papua', fixtureFolder)

  const files = listFilesMatching('*', fixtureFolder)

  expect(files.length).toBe(5)
  expect(files).toContain('.gitignore')
  expect(files).toContain('index.tsx')
  expect(files).toContain('package.json')
  expect(files).toContain('tsconfig.json')
  expect(files).toContain('package-lock.json')
})

test('Node API downloads and installs papua javascript package.', async () => {
  mkdirSync(fixtureFolder)

  await create('papua', fixtureFolder, 'javascript')

  const files = listFilesMatching('*', fixtureFolder)

  expect(files.length).toBe(5)
  expect(files).toContain('.gitignore')
  expect(files).toContain('index.jsx')
  expect(files).toContain('package.json')
  expect(files).toContain('jsconfig.json')
  expect(files).toContain('package-lock.json')
})
