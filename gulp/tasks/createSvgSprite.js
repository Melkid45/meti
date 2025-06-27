import gulp from 'gulp';
import svgSprite from 'gulp-svg-sprite';

import { filePaths } from '../config/paths.js';
import { plugins } from '../config/plugins.js';

const svgSprive = () => {
  return gulp
    .src(filePaths.src.svgIcons, {})
    .pipe(plugins.handleError('SVG'))
    .pipe(
      svgSprite({
        shape: {
          properties: {
            fill: 'none',
          },
        },
        mode: {
          stack: {
            inline: true,
            sprite: '../icons/icons.svg',

            /** Generate a page with a list of icons */
            example: false,
          },
        },
      })
    )
    .pipe(gulp.dest(filePaths.build.images));
};

export { svgSprive };
