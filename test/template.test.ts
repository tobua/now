import { afterAll, beforeAll, expect, spyOn, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { type MockSTDIN, stdin } from 'mock-stdin'
import { cachePath } from '../config'
import { downloadTemplate } from '../download-template'
import { cleanup } from '../helper'
import { getTemplateDirectory } from '../template-directory'

let io: MockSTDIN
beforeAll(() => {
  io = stdin()
})
afterAll(() => io.restore())

const keys = {
  down: '\x1B\x5B\x42',
  enter: '\x0D',
}

test('Successfully downloads the template and stores it temporarly.', async () => {
  const cache = cachePath('padua-default')
  cleanup(cache)

  expect(existsSync(cache)).toBeFalsy()
  await downloadTemplate('tobua/padua', cache)
  expect(existsSync(cache)).toBeTruthy()
  // Template directory exists.
  expect(existsSync(join(cache, 'padua-main', 'template'))).toBeTruthy()
  // Whole repo is checked out.
  expect(existsSync(join(cache, 'padua-main', 'package.json'))).toBeTruthy()

  cleanup(cache)

  expect(existsSync(cache)).toBeFalsy()
})

test('Locates template in main directory.', async () => {
  let templatePath = await getTemplateDirectory(undefined, undefined, join(process.cwd(), 'test/fixture/basic'))

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/basic'))

  // Same result with default preselected.
  templatePath = await getTemplateDirectory('default', undefined, join(process.cwd(), 'test/fixture/basic'))

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/basic'))
})

test('Recoginizes several templates are available.', async () => {
  // Mocks selection of second template available.
  const sendKeystrokes = () => {
    io.send(keys.down)
    io.send(keys.down)
    io.send(keys.enter)
  }

  setTimeout(() => sendKeystrokes(), 5)

  const templatePath = await getTemplateDirectory(undefined, undefined, join(process.cwd(), 'test/fixture/nested'))

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/nested/second'))
})

test('Fails when given template not available.', async () => {
  const mockProcessExit = spyOn(process, 'exit').mockImplementation(() => {
    // Throw instead of exit, to stop execution.
    throw new Error('Exit')
  })

  expect(getTemplateDirectory('fourth', undefined, join(process.cwd(), 'test/fixture/nested'))).rejects.toEqual(new Error('Exit'))

  expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('Automatically selects first template if only one is available.', async () => {
  const templatePath = await getTemplateDirectory(undefined, undefined, join(process.cwd(), 'test/fixture/single'))

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/single/first'))
})

test('Automatically selects default template if no selection provided.', async () => {
  const templatePath = await getTemplateDirectory(undefined, undefined, join(process.cwd(), 'test/fixture/default'))
  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/default/default'))
})

test('Successfully downloads template from main branch repository.', async () => {
  const cache = cachePath('squak-default')
  cleanup(cache)

  expect(existsSync(cache)).toBeFalsy()
  await downloadTemplate('tobua/squak', cache)
  expect(existsSync(cache)).toBeTruthy()
  // Template directory exists.
  expect(existsSync(join(cache, 'squak-main', 'template'))).toBeTruthy()
  expect(existsSync(join(cache, 'squak-main', 'template/full/app.ts'))).toBeTruthy()
  // Whole repo is checked out.
  expect(existsSync(join(cache, 'squak-main', 'package.json'))).toBeTruthy()
})

test('Finds template even when README present in template folder.', async () => {
  const cache = cachePath('squak-default')
  // Uses template downloaded in previous test.
  const templateDirectory = await getTemplateDirectory('full', cache)

  expect(templateDirectory).toEqual(join(cache, 'squak-main', 'template/full'))

  cleanup(cache)
})

test('Downloads multiple templates in parallel.', async () => {
  const cachePadua = cachePath('padua-default')
  const cachePapua = cachePath('papua-default')

  cleanup(cachePadua)
  cleanup(cachePapua)

  expect(existsSync(cachePadua)).toBeFalsy()
  expect(existsSync(cachePapua)).toBeFalsy()

  const paduaDownload = downloadTemplate('tobua/padua', cachePadua)
  const papuaDownload = downloadTemplate('tobua/papua', cachePapua)

  await Promise.all([paduaDownload, papuaDownload])

  expect(existsSync(cachePadua)).toBeTruthy()
  expect(existsSync(cachePapua)).toBeTruthy()
  // Template directory exists.
  expect(existsSync(join(cachePadua, 'padua-main', 'template'))).toBeTruthy()
  expect(existsSync(join(cachePapua, 'papua-main', 'template'))).toBeTruthy()
  // Whole repo is checked out.
  expect(existsSync(join(cachePadua, 'padua-main', 'package.json'))).toBeTruthy()
  expect(existsSync(join(cachePapua, 'papua-main', 'package.json'))).toBeTruthy()

  cleanup(cachePadua)
  cleanup(cachePapua)

  expect(existsSync(cachePadua)).toBeFalsy()
  expect(existsSync(cachePapua)).toBeFalsy()
})
