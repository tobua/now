<p align="center">
  <img src="https://github.com/tobua/now/raw/master/logo.png" alt="now" width="300">
</p>

# now

Create projects from templates.

## Usage

Install template for compatible packages like this:

```
npm init now padua
```

## Options

```
npm init now npm-package-name [destination] [template]

# Example: Use typescript template and place result in /my-plugin folder.
npm init now padua my-plugin typescript
```

The second argument can be used to describe the location where to place the project while the third describes the template to use. Both parameters are optional. If no location is provided the current directory will be used. If there is more than one template available for the package, but no template selected then a prompt will appear.

## Templates

The following npm packages already provide templates to install with `now`.

- papua
- padua

## Convention

To configure your package to allow templates to be generated with this plugin you will need a `/template` folder at the top level.

//

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
