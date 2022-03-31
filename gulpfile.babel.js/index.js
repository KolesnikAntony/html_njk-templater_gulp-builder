import gulp from 'gulp';
import browserSync from 'browser-sync';
import { lstatSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { paths } from './config';

const tasksDirectory = 'gulpfile.babel.js/tasks';
const isDirectory = (source) => lstatSync(source).isDirectory();
const getDirectoriesNames = (source) => readdirSync(source).map((name) => isDirectory(join(source, name)) && name);

getDirectoriesNames(tasksDirectory).forEach((taskName) => require(resolve(tasksDirectory, taskName)));

const pugConfig = {
  paths: [`${paths.src}/**/*.pug`, `${paths.src}/**/*.html`],
  series: 'pug',
};

const ejsConfig = {
  paths: [`${paths.src}/**/*.ejs`, `${paths.src}/**/*.html`],
  series: 'ejs',
};

const njkConfig = {
  paths: [`${paths.src}/**/*.njk`, `${paths.src}/**/*.html`],
  series: 'nunjucks',
};

gulp.task('watch', () => {
  gulp
    .watch(njkConfig.paths, gulp.series(njkConfig.series))
    .on('change', browserSync.reload);
  gulp
    .watch(`${paths.src}/**/*.scss`, gulp.series('scss'))
    .on('change', browserSync.reload);
  gulp
    .watch(`${paths.src}/**/*.js`, gulp.series('scripts'))
    .on('change', browserSync.reload);
  gulp
    .watch(`${paths.src}/images/**/*`, gulp.series('images'))
    .on('change', browserSync.reload);
  gulp
    .watch(`${paths.src}/fonts/**/*`, gulp.series('fonts'))
    .on('change', browserSync.reload);
});

gulp.task(
  'dev',
  gulp.series(
    'clean',
    'nunjucks',
    'scss',
    'scripts',
    'images',
    'fonts',
    gulp.parallel('browser-sync', 'watch'),
  ),
);
gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('nunjucks', 'scss', 'scripts', 'images', 'fonts'),
  ),
);
gulp.task(
  'deploy',
  gulp.series(
    'clean',
    gulp.parallel('nunjucks', 'scss', 'scripts', 'images', 'fonts'),
    'ftp',
  ),
);

gulp.task('default', gulp.series('dev'));
