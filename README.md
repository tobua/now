<p align="center">
  <img src="https://github.com/tobua/now/raw/main/logo.png" alt="now" width="300">
</p>

# now

Create projects from templates.

## Usage

Install template for compatible packages like this:

```sh
npm init --yes now papua
# or the same thing with npx
npx --yes create-now papua
# using Bun
bun create now papua
```

`--yes` avoids the prompt by `npm` to install this package.

## Options

```sh
npm init now npm-package-name [destination] [template] [variable-values]
```

The second argument can be used to describe the location where to place the project while the third describes the template to use. Both parameters are optional. If no location is provided the current directory will be used. If there is more than one template available for the package, but no template selected then a prompt will appear.

### Example

Use the papua build tool with the `website` template and place result in `/my-site` folder.

```sh
npm init now papua my-site website
```

Create a React Native app managed with numic inside the `/my-app` folder avoiding the prompt for a bundle name by presetting the variable.

```sh
npm init now numic my-app default name=tesla
```

## Templates

The following npm packages provide templates to install with `now`.

- [papua](https://github.com/tobua/papua) Web development build framework.
- [padua](https://github.com/tobua/padua) npm plugin development build tool.
- [naven](https://github.com/tobua/naven) React UI library.
- [squak](https://github.com/tobua/squak) Node backend framework.
- [numic](https://github.com/tobua/numic) Managed React Native setup.

## Convention

To configure your package to allow templates to be generated with this plugin you will need a `/template` folder at the top level.

```
repository-root
│   README.md
│   package.json
└───template
    │   package.json
    └   index.js
```

If you want to provide several templates create a folder for each one inside `/template` and `now` will prompt the user which one to use. For this to work it's important that there are no other files located in the template root. If there is a `default` named template available and the user has not selected a template to be used on invocation this one will be used without prompting.

```
repository-root
│   ...
└───template
    ├───javascript
    │   │   package.json
    │   └   index.js
    │
    ├───typescript
    │   │   package.json
    │   │   index.ts
    │   └   tsconfig.json
    │
    └───[default]
        └   package.json
```

It's not necessary that the templates are published to npm as they will be downloaded from the git repository linked in the `package.json` of the respective plugin.

### Variables

Template files can be enhanced with static or user-defined variables. Use the [EJS](https://ejs.co/) to place them in any of your files. Here is an example of a dynamic `package.json`:

```json
{
  "name": "<%= name %>",
  "description": "<%= description %>"
}
```

The variable contents need to be defined in a `template.json` file at the top of your template. Variables are static and need to be defined in advance, while prompts are dynamic and will be prompted to the user when the template is generated. The syntax for [prompts](https://github.com/terkelg/prompts) matches the npm package with the same name.

```json
{
  "variables": {
    "name": "my-plugin"
  },
  "prompts": [
    {
      "name": "description"
    }
  ]
}
```

To avoid the prompt the variables can also be supplied as arguments:

```
npm init --yes now padua ./my-plugin typescript name=my-plugin description="What it does."
```

### Options

In the optional `template.json` file you can add further options to configure the process.

```js
{
  "variables": {...},
  "prompts": [...],
  "noInstall": true,
  "excludeTransform": ["index.html"]
}
```

`noInstall` [false] prevents npm install even if dependencies or devDependencies found in package.json

`excludeTransform` [none] template variables like `<% whatever %>` will be ignored, only one's with `<# here #>` will be replaced.

## node Usage

```js
import { create } from 'create-now'

await create('papua')
// Arguments two and three are optional.
// Will throw an error if there are several templates but none has been selected.
await create('padua', 'new-plugin', 'javascript')
// Use '.' for the second argument for current folder.
await create('papua', '.')
```
