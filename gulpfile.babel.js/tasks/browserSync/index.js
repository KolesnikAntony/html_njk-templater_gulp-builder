import gulp from 'gulp';
import browserSync from 'browser-sync';
import { paths } from '../../config';

export default gulp.task('browser-sync', () => browserSync({
  server: {
    baseDir: paths.dist,
  },
  notify: false,
  reloadThrottle: 2000,
}));
