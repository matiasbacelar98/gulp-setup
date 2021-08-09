const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const terser = require('gulp-terser');
const concat = require('gulp-concat');

const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

// HTML
function htmlTask() {
   return src('./*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest('dist'));
}

// SCSS
function scssTask() {
   return src('src/scss/**/*.scss', { sourcemaps: true })
      .pipe(sass())
      .pipe(concat('styles.css'))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(dest('dist', { sourcemaps: '.' }));
}

// JS
function jsTask() {
   return src('src/js/**/*.js')
      .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
      .pipe(concat('main.js'))
      .pipe(terser())
      .pipe(dest('dist/', { sourcemaps: true }));
}

// Img
function imgMinTask() {
   return src(`src/**/*.{gif,png,jpg,svg}`).pipe(imagemin()).pipe(dest('dist'));
}

// BrowserSync Server
function browsersyncServe(cb) {
   browserSync.init({
      notify: false,
      open: true,
      server: {
         baseDir: ['./', './src'],
      },
   });
   cb();
}

// BrowserSync Reload Server
function browsersyncReload(cb) {
   browserSync.reload();
   cb();
}

// Watch
function watchTask() {
   watch(`src/*.html`, series(htmlTask, browsersyncReload));
   watch(
      ['src/scss/**/*.scss', 'src/js/**/*.js'],
      series(scssTask, jsTask, browsersyncReload)
   );
}

exports.default = series(
   parallel(htmlTask, imgMinTask, scssTask, jsTask),
   browsersyncServe,
   watchTask
);
