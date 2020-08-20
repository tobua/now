<p align="center">
  <img src="https://github.com/tobua/now/raw/master/logo.png" alt="now" width="300">
</p>

# now

Create projects from templates.

## Usage

Install template for compatible packages like this:

```shell
npm init now padua
```

## Options

```shell
npm init now npm-package-name [destination] [template]
```

The second argument can be used to describe the location where to place the project while the third describes the template to use. Both parameters are optional. If no location is provided the current directory will be used. If there is more than one template available for the package, but no template selected then a prompt will appear.

### Example

Use typescript template and place result in /my-plugin folder.

```shell
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
    │   index.js
```

If you want to provide several templates create a folder for each one inside `/template` and `now` will prompt the user which one to use. For this to work it's important that there are no other files located in the template root. If there is a `default` named template available and the user has not selected a template to be used on invocation this one will be used without prompting.

```
repository-root
│   ...
└───template
    └───javascript
    │   │   package.json
    │   └   index.js
    │
    └───typescript
    │   │   package.json
    │   │   index.ts
    │   └   tsconfig.json
    │
    └───[default]
        └   package.json
```

It's not necessary that the templates are published to npm as they will be downloaded from the git repository linked in the `package.json` of the respective plugin.

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
