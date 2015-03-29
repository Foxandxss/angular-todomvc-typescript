var gulp      = require('gulp');
var connect   = require('gulp-connect');
var templates = require('gulp-angular-templatecache');
var ts        = require('gulp-typescript');
var html5Mode = require('connect-history-api-fallback');

var paths = {
  scripts: ['src/app.ts', 'src/**/*.ts'],
  templates: 'src/**/*.tpl.html',
  index: 'src/index.html',
  todoCss: 'src/app.css',
  definitions: 'typings/**/*.d.ts',
  out: 'tmp/'
};

gulp.task('scripts', function() {
  var tsResult = gulp.src(paths.scripts.concat(paths.definitions))
    .pipe(ts({
      noExternalResolve: true,
      out: 'app.js'
    }));

  return tsResult.js.pipe(gulp.dest(paths.out));
});

gulp.task('templates', function() {
  return gulp.src(paths.templates)
    .pipe(templates({
      module: 'todo'
    }))
    .pipe(gulp.dest(paths.out))
});

gulp.task('todo-css', function() {
  return gulp.src(paths.todoCss)
    .pipe(gulp.dest(paths.out));
});

gulp.task('html', function() {
  return gulp.src(paths.index)
    .pipe(gulp.dest(paths.out));
});

gulp.task('webserver', ['scripts', 'templates', 'html', 'todo-css'], function() {
  connect.server({
    root: paths.out,
    port: 5000,
    middleware: function(connect, o) {
      return [html5Mode];
    }
  });
});

gulp.task('watch', ['webserver'], function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.index, ['html']);
});

gulp.task('default', ['watch']);
