import { mkdirSync, readFileSync } from 'node:fs'
import { link, mkdir, readlink, realpath, symlink, utimes, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
// @ts-ignore
import decompressTar from 'decompress-tar'
// @ts-ignore
import decompressTarbz2 from 'decompress-tarbz2'
// @ts-ignore
import decompressTargz from 'decompress-targz'
// @ts-ignore
import decompressUnzip from 'decompress-unzip'
// @ts-ignore
import stripDirs from 'strip-dirs'

interface PathFile {
  path: string
  mode: number
  type: string
  mtime: Date
  linkname: string
  data: string
}

interface Options {
  strip: number
  filter?: () => boolean
  map?: (value: PathFile) => PathFile
  plugins: ((input: Buffer, options: Options) => string)[]
}

function runPlugins(input: Buffer, options: Options) {
  if (options.plugins.length === 0) {
    return Promise.resolve([])
  }

  return Promise.all(options.plugins.map((x) => x(input, options))).then((files) => files.reduce((a, b) => a.concat(b)))
}

function safeMakeDir(directory: string, realOutputPath: string): Promise<string> {
  return realpath(directory)
    .catch((_) => {
      const parent = dirname(directory)
      return safeMakeDir(parent, realOutputPath)
    })
    .then((realParentPath) => {
      if (realParentPath.indexOf(realOutputPath) !== 0) {
        throw new Error('Refusing to create a directory outside the output path.')
      }

      mkdirSync(directory, { recursive: true })
      return directory
    })
}

const preventWritingThroughSymlink = (destination: string, realOutputPath: string) => {
  return readlink(destination)
    .catch((_) => {
      // Either no file exists, or it's not a symlink. In either case, this is
      // not an escape we need to worry about in this phase.
      return null
    })
    .then(() => {
      // No symlink exists at `destination`, so we can continue
      return realOutputPath
    })
}

const extractFile = (input: Buffer, output: string, options: Options) =>
  runPlugins(input, options).then((input) => {
    let files: PathFile[] = input as PathFile[]
    if (options.strip > 0) {
      files = files
        .map((x) => {
          x.path = stripDirs(x.path, options.strip)
          return x
        })
        .filter((x) => x.path !== '.')
    }

    if (typeof options.filter === 'function') {
      files = files.filter(options.filter)
    }

    if (typeof options.map === 'function') {
      files = files.map(options.map)
    }

    if (!output) {
      return files
    }

    return Promise.all(
      files.map((x) => {
        const dest = join(output, x.path)
        const mode = x.mode & ~process.umask()
        const now = new Date()

        if (x.type === 'directory') {
          mkdir(output, { recursive: true })

          return realpath(output)
            .then((realOutputPath) => safeMakeDir(dest, realOutputPath))
            .then(() => utimes(dest, now, x.mtime))
            .then(() => x)
        }

        mkdir(output, { recursive: true })

        return realpath(output)
          .then((realOutputPath) => {
            // Attempt to ensure parent directory exists (failing if it's outside the output dir)
            return safeMakeDir(dirname(dest), realOutputPath).then(() => realOutputPath)
          })
          .then((realOutputPath) => {
            if (x.type === 'file') {
              return preventWritingThroughSymlink(dest, realOutputPath)
            }

            return realOutputPath
          })
          .then((realOutputPath) => {
            return realpath(dirname(dest)).then((realDestinationDir) => {
              if (realDestinationDir.indexOf(realOutputPath) !== 0) {
                throw new Error(`Refusing to write outside output directory: ${realDestinationDir}`)
              }
            })
          })
          .then(() => {
            if (x.type === 'link') {
              return link(x.linkname, dest)
            }

            if (x.type === 'symlink' && process.platform === 'win32') {
              return link(x.linkname, dest)
            }

            if (x.type === 'symlink') {
              return symlink(x.linkname, dest)
            }

            return writeFile(dest, x.data, { mode })
          })
          .then(() => {
            if (x.type === 'file') {
              utimes(dest, now, x.mtime)
            }
          })
      }),
    )
  })

export function decompress(inputZipFile: string, destinationDirectory: string) {
  if (typeof inputZipFile !== 'string' && !Buffer.isBuffer(inputZipFile)) {
    return Promise.reject(new TypeError('Input file required'))
  }
  const options: Options = { strip: 0, plugins: [decompressTar(), decompressTarbz2(), decompressTargz(), decompressUnzip()] }
  return extractFile(readFileSync(inputZipFile), destinationDirectory, options)
}
