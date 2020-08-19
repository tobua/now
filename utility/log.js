import chalk from 'chalk'

export const log = (message, type) => {
  const namespace = chalk.gray.bold('create-now')

  if (type === 'error') {
    console.log(`${namespace} ${chalk.red.bold('Error')} ${message}.\n`)
    process.exit(0)
    return
  }

  if (type === 'warning') {
    console.log(`${namespace} ${chalk.orange('Warning')} ${message}.\n`)
    return
  }

  console.log(`${namespace} ${message}.\n`)
}
