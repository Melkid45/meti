# METI html/css

## To work with this project, follow these commands:

- To install all dependencies: `$ npm install`;
- To start the Gulp builder, use: `$ npm run dev`;
- To build the project in `"production"` mode: `$ npm run build`;

## What does Gulp do?

- Minifies HTML in `production` mode;
- Removes comments from HTML in `production` mode;
- Compiles SCSS files, adds vendor prefixes;
- Removes comments from SCSS files;
- In `production` mode, minifies CSS and creates an uncompressed copy;
- Converts fonts to `.ttf`, and from `.ttf` to `.woff/.woff2`;
- Creates a file for font inclusion. This file is created at: `src/scss/config/fonts.scss`, and looks like this:

```scss
@font-face {
  font-family: Inter;
  font-display: swap;
  src: url('../fonts/Inter-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
}
```

### ATTENTION!!!

> If the `src/scss/config` - folder already contains a `fonts.scss` - file, then when adding new fonts, you MUST DELETE the old `fonts.scss` file. Don't worry, when you run the build again, Gulp will convert all new fonts and create a new `fonts.scss` file.

Next, what else the build can do:

- Compresses images and converts them to the `.webp` format, and includes them if the browser supports it;
- Copies the `/static` folder and its contents to the final build. This means you can place any files in this folder, and they will be added to the final build;
- With the command `$ npm run svgSprite`, it creates "SVG sprites";
- Before each build, it cleans the final project folder to avoid building garbage;
- With the command `$ npm run zip`, you can archive the final folder for the client with the project name;
- Also, for development, `gulp` starts a server with automatic browser window reloading when files in the project are changed;
- With the command `$ npm run deployFTP`, the final project is uploaded to hosting. The options for sending the project to the desired hosting are specified in the file: `gulp/config/ftp.js`.

## What does WebPack do?

- In this build, `webpack` handles JavaScript files;
- Supports modular script `import/export`;
- When importing, there's no need to write the `.js` file extension, and if importing from the `index.js` file, you don't need to specify it:

```javascript
import * as flsFunctions from './modules' // './modules/index.js'
```

- With the help of `babel`, `webpack` allows you to write code in your favorite **ES6+**;
- In `"production"` mode, during the final build, JS files are minified, and unnecessary comments are removed.

## Finale

An added bonus is the `gh-pages` plugin for deploying the `/dist` folder to a separate GitHub branch, to beautifully showcase your project on GitHub Pages. For this, specify the link to your gh-pages in the **homepage** field in `package.json`:

```json
"homepage": "https://{UserName}.github.io/{NameRepo}",
```

For any build-related questions, feel free to message me on [Telegram](https://t.me/boyko1396).
