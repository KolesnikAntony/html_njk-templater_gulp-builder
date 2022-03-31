import gulp from 'gulp';
import gulpIf from 'gulp-if';
import path from 'path';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cssnano from 'gulp-cssnano';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import es from 'event-stream';
import yargs from 'yargs';
import { paths } from '../../config';

const flag = yargs.argv;

export default gulp.task('scss', (done) => {
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
    .pipe(gulpIf(!flag.prod, sourcemaps.init()))
    .pipe(
      sass({
        includePaths: paths.src,
      }),
    )
    .pipe(
      autoprefixer(['last 20 versions', '> 0.1%'], {
        cascade: true,
      }),
    )
    .pipe(
      gulpIf(
        flag.prod,
        cssnano({
          zIndex: false,
        }),
      ),
    )
    .pipe(gulpIf(!flag.prod, sourcemaps.write()))
    .pipe(gulp.dest(path.resolve(paths.dist, paths.styleSheets.dist)));

  if (Array.isArray(paths.styleSheets.src)) {
    const entries = paths.styleSheets.src.map((path) => `${paths.src}/${path}`);
    const tasks = entries.map((entry) => task(entry));

    return es.merge(tasks).on('end', done);
  }

  return task(path.resolve(paths.src, paths.styleSheets.src));
});
