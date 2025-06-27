import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';
import cleanCss from 'gulp-clean-css'; // CSS Minification
import webpCss from 'gulp-webpcss'; // WEBP Image Output
import groupMediaQueries from 'gulp-group-css-media-queries'; // Grouping Media Queries
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import postcssPresetEnv from 'postcss-preset-env';

import { filePaths } from '../config/paths.js';
import { plugins } from '../config/plugins.js';
import { isBuild, isDev } from '../../gulpfile.js';

const sass = gulpSass(dartSass);

const scss = () => {
  const webpConfig = {
    webpClass: '.webp',
    noWebpClass: '.no-webp',
  };

  return (
    gulp
      .src(filePaths.src.scss, { sourcemaps: isDev })
      .pipe(plugins.handleError('SCSS'))

      .pipe(sass({ outputStyle: 'expanded' }))
      .pipe(plugins.replace(/@img\//g, '../images/'))

      /** Group media queries only for production */
      .pipe(plugins.if(isBuild, groupMediaQueries()))

      .pipe(plugins.if(isBuild, webpCss(webpConfig)))
      .pipe(plugins.if(isBuild, postcss([autoprefixer(), postcssPresetEnv()])))

      /** Uncomment if an uncompressed duplicate of the styles file is needed */
      // .pipe(gulp.dest(filePaths.build.css))

      .pipe(plugins.if(isBuild, cleanCss()))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest(filePaths.build.css))
      .pipe(plugins.browserSync.stream())
  );
};

export { scss };
