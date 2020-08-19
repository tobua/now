import chalk from 'chalk'

export const log = (message, type) => {
  const namespace = chalk.gray.bold('create-now')

  if (type === 'error') {
    // eslint-disable-next-line no-console
    console.log(`${namespace} ${chalk.red.bold('Error')} ${message}.\n`)
    process.exit(0)
    return
  }

  if (type === 'warning') {
    // eslint-disable-next-line no-console
    console.log(`${namespace} ${chalk.orange('Warning')} ${message}.\n`)
    return
  }

  // eslint-disable-next-line no-console
  console.log(`${namespace} ${message}.\n`)
}
