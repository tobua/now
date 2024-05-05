import { expect, spyOn, test } from 'bun:test'
import { cachePath } from '../config'
import { loadPackage } from '../load-package'

test('Returns correct url for various packages.', async () => {
  let url = await loadPackage('padua')
  expect(url).toEqual('tobua/padua')
  url = await loadPackage('react')
  expect(url).toEqual('facebook/react')
})

test('Fails for non-existent packages.', async () => {
  const mockProcessExit = spyOn(process, 'exit').mockImplementation(() => {
    // Throw instead of exit, to stop execution.
    throw new Error('Exit')
  })

  await expect(loadPackage('pamua')).rejects.toEqual(new Error('Exit'))

  expect(mockProcessExit).toHaveBeenCalledWith(0)
})

test('Finds config path.', () => {
  const cache = cachePath('papua-default')
  expect(cache).toBeDefined()
})
