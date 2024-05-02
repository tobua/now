import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Config } from '../types'
import { log } from './log'

export const installDependencies = (config: Config, destination: string) => {
  if (config.noInstall) {
    return
  }

  const packageJsonPath = join(destination, 'package.json')

  let packageContents: { dependencies?: { [key: string]: string }; devDependencies?: { [key: string]: string } } = {}

  try {
    if (existsSync(packageJsonPath)) {
      packageContents = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    }
  } catch (_) {
    // Ignored
  }

  // Install only required if there are dependencies.
  const { dependencies, devDependencies } = packageContents

  if (!(dependencies || devDependencies)) {
    return
  }

  let hasContents = false

  if (typeof dependencies === 'object' && Object.keys(dependencies).length > 0) {
    hasContents = true
  }

  if (typeof devDependencies === 'object' && Object.keys(devDependencies).length > 0) {
    hasContents = true
  }

  if (!hasContents) {
    return
  }

  log('installing dependencies')

  execSync('bun install', { stdio: 'inherit', cwd: destination })

  log('dependencies installed')
}
