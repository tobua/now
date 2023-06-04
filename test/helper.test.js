import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { test, expect, vi } from 'vitest'
import { getDestinationPath, validatePackageName } from '../utility/helper.js'

test('Validates package name correctly.', () => {
  vi.spyOn(process, 'exit').mockImplementation(() => {
    // Throw instead of exit, to stop execution.
    throw new Error('Exit')
  })

  expect(() => validatePackageName('padua')).not.toThrow()
  // Not strings
  expect(() => validatePackageName(5)).toThrow()
  expect(() => validatePackageName()).toThrow()
  // Valid, can be URL encoded.
  expect(() => validatePackageName('test-hello')).not.toThrow()
  // Invalid.
  expect(() => validatePackageName('test/hello')).toThrow()
})

test('Returns correct destination paths.', () => {
  const cwd = process.cwd()

  // Place contents inside current location.
  expect(getDestinationPath()).toEqual(cwd)
  // Use current folder.
  expect(getDestinationPath('.')).toEqual(cwd)
  // Use and create directory.
  expect(existsSync(join(cwd, 'somewhere'))).toBeFalsy()
  expect(getDestinationPath('somewhere')).toEqual(join(cwd, 'somewhere'))
  expect(existsSync(join(cwd, 'somewhere'))).toBeTruthy()
  // Use and create nested directories.
  expect(existsSync(join(cwd, 'some/where'))).toBeFalsy()
  expect(getDestinationPath('some/where')).toEqual(join(cwd, 'some/where'))
  expect(existsSync(join(cwd, 'some/where'))).toBeTruthy()

  // Clean up created directories.
  rmSync(join(cwd, 'somewhere'), { recursive: true })
  rmSync(join(cwd, 'some'), { recursive: true })

  // Directories have been removed.
  expect(existsSync(join(cwd, 'somewhere'))).toBeFalsy()
  expect(existsSync(join(cwd, 'some/where'))).toBeFalsy()
  expect(existsSync(join(cwd, 'some'))).toBeFalsy()
})
