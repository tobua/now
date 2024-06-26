import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test'
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { writeFile } from 'jest-fixture'
import { type MockSTDIN, stdin } from 'mock-stdin'
import { getDestinationPath, validatePackageName } from '../helper'

let io: MockSTDIN
beforeAll(() => {
  io = stdin()
})
afterAll(() => io.restore())

const keys = {
  enter: '\x0D',
}

// @ts-ignore
const mockExit = spyOn(process, 'exit').mockImplementation(() => undefined)

test('Validates package name correctly.', () => {
  spyOn(process, 'exit').mockImplementation(() => {
    // Throw instead of exit, to stop execution.
    throw new Error('Exit')
  })

  expect(() => validatePackageName('padua')).not.toThrow()
  // Not strings
  // @ts-expect-error
  expect(() => validatePackageName(5)).toThrow()
  expect(() => validatePackageName()).toThrow()
  // Valid, can be URL encoded.
  expect(() => validatePackageName('test-hello')).not.toThrow()
  // Invalid.
  expect(() => validatePackageName('test/hello')).toThrow()

  mockExit.mockRestore()
})

test('Returns correct destination paths.', async () => {
  const cwd = process.cwd()

  // Place contents inside current location.
  expect(await getDestinationPath(undefined, true)).toEqual(cwd)
  // Use current folder.
  expect(await getDestinationPath('.', true)).toEqual(cwd)
  // Use and create directory.
  expect(existsSync(join(cwd, 'somewhere'))).toBeFalsy()
  expect(await getDestinationPath('somewhere', true)).toEqual(join(cwd, 'somewhere'))
  expect(existsSync(join(cwd, 'somewhere'))).toBeTruthy()
  // Use and create nested directories.
  expect(existsSync(join(cwd, 'some/where'))).toBeFalsy()
  expect(await getDestinationPath('some/where', true)).toEqual(join(cwd, 'some/where'))
  expect(existsSync(join(cwd, 'some/where'))).toBeTruthy()

  // Clean up created directories.
  rmSync(join(cwd, 'somewhere'), { recursive: true })
  rmSync(join(cwd, 'some'), { recursive: true })

  // Directories have been removed.
  expect(existsSync(join(cwd, 'somewhere'))).toBeFalsy()
  expect(existsSync(join(cwd, 'some/where'))).toBeFalsy()
  expect(existsSync(join(cwd, 'some'))).toBeFalsy()
})

test('Clears non-empty destination path on confirmed prompt.', async () => {
  const cwd = join(process.cwd(), 'test/fixture/helper')

  if (existsSync(join(cwd, 'non-empty'))) {
    rmSync(join(cwd, 'non-empty'), { recursive: true })
  }

  // Create a directory.
  expect(await getDestinationPath('test/fixture/helper/non-empty')).toEqual(join(cwd, 'non-empty'))
  // No prompt for empty directory.
  expect(await getDestinationPath('test/fixture/helper/non-empty')).toEqual(join(cwd, 'non-empty'))

  // Add file as contents.
  expect(readdirSync(join(cwd, 'non-empty')).length === 0).toBeTruthy()
  writeFile('test/fixture/helper/non-empty/index.js', 'console.log("hello")')
  expect(readdirSync(join(cwd, 'non-empty')).length === 0).toBeFalsy()
  expect(mockExit.mock.calls.length).toBe(0)

  // Mock confirm.
  const sendKeystrokes = () => {
    io.send('y')
    io.send(keys.enter)
  }

  setTimeout(() => sendKeystrokes(), 5)

  expect(await getDestinationPath('test/fixture/helper/non-empty')).toEqual(join(cwd, 'non-empty')) // Actual prompt.
  expect(existsSync(join(cwd, 'non-empty'))).toBeTruthy()
  // Directory was cleared.
  expect(readdirSync(join(cwd, 'non-empty')).length === 0).toBeTruthy()

  // Clean up created directories.
  rmSync(join(cwd, 'non-empty'), { recursive: true })
})

test('Existing git repository is kept when overriding a folder.', async () => {
  // Restore as otherwise previous test causes issues.
  io.restore()
  io = stdin()

  const cwd = join(process.cwd(), 'test/fixture/helper')

  if (existsSync(join(cwd, 'non-empty-git'))) {
    rmSync(join(cwd, 'non-empty-git'), { recursive: true })
  }

  mkdirSync(join(cwd, 'non-empty-git'))

  // Add file as contents.
  expect(readdirSync(join(cwd, 'non-empty-git')).length === 0).toBeTruthy()
  writeFile('test/fixture/helper/non-empty-git/index.js', 'console.log("hello")')
  writeFile('test/fixture/helper/non-empty-git/.git/.gitkeep', 'console.log("hello")')
  expect(readdirSync(join(cwd, 'non-empty-git')).length === 2).toBeTruthy()
  expect(mockExit.mock.calls.length).toBe(0)

  // Mock confirm.
  const sendKeystrokes = () => {
    io.send('n')
    io.send(keys.enter)
  }

  setTimeout(() => sendKeystrokes(), 5)

  expect(await getDestinationPath('test/fixture/helper/non-empty-git')).toEqual(join(cwd, 'non-empty-git')) // Actual prompt.

  expect(existsSync(join(cwd, 'non-empty-git'))).toBeTruthy()
  // Directory was cleared.
  expect(readdirSync(join(cwd, 'non-empty-git')).length).toBe(2)

  // Clean up created directories.
  rmSync(join(cwd, 'non-empty-git'), { recursive: true })
})
