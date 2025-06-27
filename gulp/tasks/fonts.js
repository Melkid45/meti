import gulp from 'gulp';
import fs from 'fs';
import chalk from 'chalk';
import fonter from 'gulp-fonter-fix';
import ttf2woff2 from 'gulp-ttf2woff2';

import { filePaths } from '../config/paths.js';
import { plugins } from '../config/plugins.js';

const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  heavy: 800,
  black: 900,
};

const otfToTtf = () => {
  return (
    gulp
      .src(`${filePaths.srcFolder}/fonts/*.otf`, {})
      .pipe(plugins.handleError('FONTS'))

      /** Convert to .ttf */
      .pipe(fonter({ formats: ['ttf'] }))

      /** Save to the original folder */
      .pipe(gulp.dest(`${filePaths.srcFolder}/fonts/`))
  );
};

const ttfToWoff = () => {
  return (
    gulp
      .src(`${filePaths.srcFolder}/fonts/*.ttf`, {})
      .pipe(plugins.handleError('FONTS'))
      .pipe(ttf2woff2())
      .pipe(gulp.dest(`${filePaths.build.fonts}`))

      /**
       * Uncomment if needed.
       * Convert to [.woff]
       * */
      //.pipe(gulp.src(`${filePaths.srcFolder}/fonts/*.ttf`))
      //.pipe(fonter({ formats: ['woff'] }))
      //.pipe(gulp.dest(`${filePaths.build.fonts}`))

      /** Find [.woff, .woff2] fonts and save to the final folder */
      .pipe(gulp.src(`${filePaths.srcFolder}/fonts/*.{woff,woff2}`))
      .pipe(gulp.dest(`${filePaths.build.fonts}`))
  );
};

const fontStyle = () => {
  /** Font styles inclusion file */
  const fontStylesFile = `${filePaths.srcFolder}/scss/config/fonts.scss`;

  /** Read the fonts folder and check if they exist */
  fs.readdir(filePaths.build.fonts, (err, fontFiles) => {
    if (fontFiles) {
      /** Check if the font styles inclusion file exists */
      if (!fs.existsSync(fontStylesFile)) {
        /** If the file doesn't exist, create it */
        fs.writeFile(fontStylesFile, '', cb);
        let newFileOnly;

        fontFiles.forEach((file) => {
          /** Write font inclusion to the styles file */
          const fileName = file.split('.')[0];

          if (newFileOnly !== fileName) {
            const [fontName, fontWeight = 'regular'] = fileName.split('-');
            const fontWeightValue = fontWeights[fontWeight.toLowerCase()];

            fs.appendFile(
              fontStylesFile,
              `@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fileName}.woff2") format("woff2");\n\tfont-weight: ${fontWeightValue};\n\tfont-style: normal;\n}\n`,
              cb
            );

            newFileOnly = fileName;
          }
        });
      } else {
        /** Warning if the file exists - it needs to be deleted */
        console.log(
          chalk.bold.white.bgGreenBright(
            'The file scss/config/fonts.scss already exists.\nTo update the file, it needs to be deleted!'
          )
        );
      }
    }
  });

  return gulp.src(filePaths.srcFolder);

  function cb(err) {
    if (err) {
      console.log(chalk.bold.white.bgRed('File write error: '), err);
    } else {
      console.log(
        chalk.bold.white.bgGreenBright('[fonts.scss file successfully written]')
      );
    }
  }
};

export { otfToTtf, ttfToWoff, fontStyle };
