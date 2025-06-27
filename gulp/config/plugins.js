import replace from 'gulp-replace'; // Search and Replace
import plumber from 'gulp-plumber'; // Error Handling
import notify from 'gulp-notify'; // Notifications (Tooltips)
import browserSync from 'browser-sync'; // Local Server
import newer from 'gulp-newer'; // Check for Updates
import ifPlugin from 'gulp-if'; // Conditional Branching

const concatPathAndFileName = (path, files) => {
  return files.map((file) => `${path}/${file}`);
};

const handleError = (taskName) => {
  return plumber({
    errorHandler: notify.onError({
      title: taskName,
      message: 'Error: <%= error.message %>',
    }),
  });
};

export const plugins = {
  if: ifPlugin,
  replace,
  plumber,
  notify,
  browserSync,
  newer,
  concat: concatPathAndFileName,
  handleError,
};
