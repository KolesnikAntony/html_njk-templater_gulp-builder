import gulp from 'gulp';
import nunjucks from 'gulp-nunjucks-render';
import path from 'path';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import es from 'event-stream';
import { paths } from '../../config';

export default gulp.task('nunjucks', (done) => {
  const task = (src) => gulp
    .src(src)
    .pipe(
      plumber({
        errorHandler(err) {
          notify.onError({
            title: `Gulp error in ${err.plugin}`,
            message: err.toString(),
          })(err);
          this.emit('end');
        },
      }),
    )
    .pipe(
      nunjucks({
        path: paths.src,
      }),
    )
    .pipe(
      rename((path) => {
        if (path.basename === 'main') {
          path.basename = 'index';
        }
      }),
    )
    .pipe(gulp.dest(path.resolve(paths.dist, paths.njk.dist)));

  if (Array.isArray(paths.njk.src)) {
    const entries = paths.njk.src.map((path) => `${paths.src}/${path}`);
    const tasks = entries.map((entry) => task(entry));

    return es.merge(tasks).on('end', done);
  }

  return task(path.resolve(paths.src, paths.njk.src));
});
