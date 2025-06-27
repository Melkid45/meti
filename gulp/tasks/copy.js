import gulp from 'gulp';
import { filePaths } from '../config/paths.js';

const copy = () => {
  return gulp.src(filePaths.src.static).pipe(gulp.dest(filePaths.build.static));
  return gulp.src(filePaths.src.de).pipe(gulp.dest(filePaths.build.de));
};

export { copy };