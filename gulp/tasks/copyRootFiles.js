import gulp from 'gulp';
import { plugins } from '../config/plugins.js';
import { filePaths } from '../config/paths.js';

const copyRootFiles = () => {
  const config = {
    dot: true,
    allowEmpty: true,
  };

  /** Add files that are needed at the root of the project */
  const files = ['favicon.ico', '.htaccess'];

  return gulp
    .src(plugins.concat(filePaths.srcFolder, files), config)
    .pipe(gulp.dest(filePaths.buildFolder));
};

export { copyRootFiles };
