import gulp from 'gulp';
import gulpIf from 'gulp-if';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import path from 'path';
import browserify from 'browserify';
import notify from 'gulp-notify';
import vinylSourceStream from 'vinyl-source-stream';
import vinylBuffer from 'vinyl-buffer';
import yargs from 'yargs';
import es from 'event-stream';
import { paths } from '../../config';

const flag = yargs.argv;

export default gulp.task('scripts', (done) => {
  const task = (src, filename) => browserify({
    entries: [src],
    paths: [paths.src],
    debug: !flag.prod,
  })
    .transform('babelify', {
      presets: ['@babel/preset-env'],
    })
    .bundle()
    .on('error', function (error) {
      notify.onError({
        title: `Gulp error in ${error.plugin}`,
        message: error.toString(),
      })(error);
      this.emit('end');
    })
    .pipe(vinylSourceStream(filename))
    .pipe(vinylBuffer())
    .pipe(
      sourcemaps.init({
        loadMaps: true,
      }),
    )
    .pipe(gulpIf(flag.prod, uglify()))
    .pipe(gulpIf(!flag.prod, sourcemaps.write()))
    .pipe(gulp.dest(path.resolve(paths.dist, paths.javaScripts.dist)));

  if (Array.isArray(paths.javaScripts.src)) {
    const entries = paths.javaScripts.src.map((path) => `${paths.src}/${path}`);
    const tasks = entries.map((entry) => {
      const arr = entry.split('/');
      const name = arr[arr.length - 1];

      return task(entry, name);
    });

    return es.merge(tasks).on('end', done);
  }

  return task(path.resolve(paths.src, paths.javaScripts.src), 'index.js');
});
