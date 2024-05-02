export type Config = {
  variables?: { [key: string]: string }
  prompts?: { name: string; type: 'text'; message: string }[]
  noInstall?: boolean
  excludeTransform?: string[]
}
