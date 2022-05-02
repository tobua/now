import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { log } from './log.js'

export const installDependencies = (config, destination) => {
  if (config.noInstall) {
    return
  }

  const packageJsonPath = join(destination, 'package.json')

  let packageContents = {}

  try {
    if (existsSync(packageJsonPath)) {
      packageContents = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    }
  } catch (_) {
    // Ignored
  }

  // Install only required if there are dependencies.
  const { dependencies, devDependencies } = packageContents

  if (!dependencies && !devDependencies) {
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

  execSync('npm install --legacy-peer-deps', { stdio: 'inherit', cwd: destination })

  log('dependencies installed')
}
