const { existsSync } = require('fs')
const { join } = require('path')
const { stdin } = require('mock-stdin')
const { gitStorePathAbsolute } = require('../config.js')
const { cleanup } = require('../utility/helper.js')
const { downloadTemplate } = require('../utility/download-template.js')
const { getTemplateDirectory } = require('../utility/template-directory.js')

let io = null
beforeAll(() => {
  io = stdin()
})
afterAll(() => io.restore())

const keys = {
  up: '\x1B\x5B\x41',
  down: '\x1B\x5B\x42',
  enter: '\x0D',
  space: '\x20',
}

test('Successfully downloads the template and stores it temporarly.', async () => {
  cleanup()

  expect(existsSync(gitStorePathAbsolute).toBeFalsy)
  await downloadTemplate('tobua/padua')
  expect(existsSync(gitStorePathAbsolute).toBeTruthy)
  // Template directory exists.
  expect(existsSync(join(gitStorePathAbsolute, 'template')).toBeTruthy)
  // Whole repo is checked out.
  expect(existsSync(join(gitStorePathAbsolute, 'package.json')).toBeTruthy)

  cleanup()

  expect(existsSync(gitStorePathAbsolute).toBeFalsy)
})

test('Locates template in main directory.', async () => {
  const templatePath = await getTemplateDirectory(
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
    'default',
    join(process.cwd(), 'test/fixture/nested')
  )

  expect(templatePath).toEqual(
    join(process.cwd(), 'test/fixture/nested/second')
  )
})
