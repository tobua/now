import { afterEach, beforeAll, expect, test } from 'bun:test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { listFilesMatching } from 'jest-fixture'
import { create } from '../index'

const fixtureFolder = join(process.cwd(), 'test/download')

beforeAll(() => existsSync(fixtureFolder) && rmSync(fixtureFolder, { recursive: true }))
afterEach(() => rmSync(fixtureFolder, { recursive: true }))

test('Node API downloads and installs papua default package.', async () => {
  mkdirSync(fixtureFolder)

  await create('papua', fixtureFolder)

  const files = listFilesMatching('*', fixtureFolder)

  // TODO two files missing, as papua not listed in trustedDependencies for this template.

  expect(files.length).toBe(3)
  // expect(files).toContain('.gitignore')
  expect(files).toContain('index.tsx')
  expect(files).toContain('package.json')
  // expect(files).toContain('tsconfig.json')
  expect(files).toContain('bun.lockb')
})

test('Node API downloads and installs papua javascript package.', async () => {
  mkdirSync(fixtureFolder)

  await create('papua', fixtureFolder, 'javascript')

  const files = listFilesMatching('*', fixtureFolder)

  expect(files.length).toBe(3)
  // expect(files).toContain('.gitignore')
  expect(files).toContain('index.jsx')
  expect(files).toContain('package.json')
  // expect(files).toContain('jsconfig.json')
  expect(files).toContain('bun.lockb')
})
