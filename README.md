<p align="center">
  <img src="https://github.com/tobua/now/raw/master/logo.png" alt="now" width="300">
</p>

# now

Create projects from templates.

## Usage

Install template for compatible packages like this:

```console
npm init now padua
```

## Options

```console
npm init now npm-package-name [destination] [template]
```

The second argument can be used to describe the location where to place the project while the third describes the template to use. Both parameters are optional. If no location is provided the current directory will be used. If there is more than one template available for the package, but no template selected then a prompt will appear.

### Example

Use typescript template and place result in /my-plugin folder.

```console
npm init now padua my-plugin typescript
```

## Templates

The following npm packages provide templates to install with `now`.

- papua
- padua

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

### Options

In the optional `template.json` file you can add further options to configure the process.

```json
{
  "variables": {...},
  "prompts": [...],
  "noInstall": true
}
```

`noInstall` [false] prevents npm install even if dependencies or devDependencies found in package.json

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
