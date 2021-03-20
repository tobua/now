const { existsSync } = require('fs')
const { join } = require('path')
const { stdin } = require('mock-stdin')
const { gitStorePathAbsolute } = require('../config.js')
const { cleanup } = require('../utility/helper.js')
const { downloadTemplate } = require('../utility/download-template.js')
const { getTemplateDirectory } = require('../utility/template-directory.js')

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

test('Successfully downloads the template and stores it temporarly.', async () => {
  cleanup()

  expect(existsSync(gitStorePathAbsolute)).toBeFalsy()
  await downloadTemplate('tobua/padua')
  expect(existsSync(gitStorePathAbsolute)).toBeTruthy()
  // Template directory exists.
  expect(existsSync(join(gitStorePathAbsolute, 'template'))).toBeTruthy()
  // Whole repo is checked out.
  expect(existsSync(join(gitStorePathAbsolute, 'package.json'))).toBeTruthy()

  cleanup()

  expect(existsSync(gitStorePathAbsolute)).toBeFalsy()
})

test('Locates template in main directory.', async () => {
  let templatePath = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/basic')
  )

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/basic'))

  // Same result with default preselected.
  templatePath = await getTemplateDirectory(
    'default',
    join(process.cwd(), 'test/fixture/basic')
  )

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/basic'))
})

test('Recoginizes several templates are available.', async () => {
  // Mocks selection of second template available.
  const sendKeystrokes = async () => {
    io.send(keys.down)
    io.send(keys.enter)
  }

  setTimeout(() => sendKeystrokes().then(), 5)

  const templatePath = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/nested')
  )

  expect(templatePath).toEqual(
    join(process.cwd(), 'test/fixture/nested/second')
  )
})

test('Fails when given template not available.', async () => {
  const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {
    // Throw instead of exit, to stop execution.
    throw new Error('Exit')
  })

  expect(
    getTemplateDirectory('fourth', join(process.cwd(), 'test/fixture/nested'))
  ).rejects.toEqual(new Error('Exit'))

  expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('Automatically selects first template if only one is available.', async () => {
  const templatePath = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/single')
  )

  expect(templatePath).toEqual(join(process.cwd(), 'test/fixture/single/first'))
})

test('Automatically selects default template if no selection provided.', async () => {
  const templatePath = await getTemplateDirectory(
    undefined,
    join(process.cwd(), 'test/fixture/default')
  )
  expect(templatePath).toEqual(
    join(process.cwd(), 'test/fixture/default/default')
  )
})

test('Successfully downloads template from main branch repository.', async () => {
  cleanup()

  expect(existsSync(gitStorePathAbsolute)).toBeFalsy()
  await downloadTemplate('tobua/squak')
  expect(existsSync(gitStorePathAbsolute)).toBeTruthy()
  // Template directory exists.
  expect(existsSync(join(gitStorePathAbsolute, 'template'))).toBeTruthy()
  expect(
    existsSync(join(gitStorePathAbsolute, 'template/full/app.ts'))
  ).toBeTruthy()
  // Whole repo is checked out.
  expect(existsSync(join(gitStorePathAbsolute, 'package.json'))).toBeTruthy()
})

test('Finds template even when README present in template folder.', async () => {
  // Uses template downloaded in previous test.
  const templateDirectory = await getTemplateDirectory('full')

  expect(templateDirectory).toEqual(join(gitStorePathAbsolute, 'template/full'))

  cleanup()
})
