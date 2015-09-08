/* eslint-disable */

var browserify = require('browserify');
var browserSync = require('browser-sync');
var duration = require('gulp-duration');
var gulp = require('gulp');
var gutil = require('gulp-util');
var notifier = require('node-notifier');
var path = require('path');
var prefix = require('gulp-autoprefixer');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var streamify = require('gulp-streamify');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var watch = require('gulp-watch');
var url = require('url');
var proxy = require('proxy-middleware');
var gettext = require('gulp-angular-gettext');

/* eslint "no-process-env":0 */
var production = process.env.NODE_ENV === 'production';

var config = {
  destination: './public',
  scripts: {
    source: './src/app.js',
    destination: './public/js/',
    filename: 'bundle.js'
  },
  templates: {
    source: './src/index.html',
    watch: './src/index.html',
    destination: './public/',
    revision: './public/**/*.html'
  },
  styles: {
    source: './src/app.scss',
    watch: ['./src/**/*.sass', './src/**/*.scss'],
    destination: './public/css/'
  },
  assets: {
    source: './src/assets/**/*.*',
    watch: './src/assets/**/*.*',
    destination: './public/'
  },
  revision: {
    source: ['./public/**/*.css', './public/**/*.js'],
    base: path.join(__dirname, 'public'),
    destination: './public/'
  },
  translations: {
    source: './po/**/*.po',
    watch: './po/**/*.po',
    destination: './public/translations'
  }
};

var browserifyConfig = {
  entries: [config.scripts.source],
  extensions: config.scripts.extensions,
  debug: !production,
  cache: {},
  packageCache: {}
};

function handleError(err) {
  gutil.log(err);
  gutil.beep();
  notifier.notify({
    title: 'Compile Error',
    message: err.message
  });
  return this.emit('end');
}

gulp.task('scripts', function() {
  var pipeline = browserify(browserifyConfig)
    .bundle()
    .on('error', handleError)
    .pipe(source(config.scripts.filename));

  if (production) {
    pipeline = pipeline.pipe(streamify(uglify()));
  }

  return pipeline.pipe(gulp.dest(config.scripts.destination));
});

gulp.task('templates', function() {
  var pipeline = gulp.src(config.templates.source)
  .on('error', handleError)
  .pipe(gulp.dest(config.templates.destination));

  if (production) {
    return pipeline;
  }

  return pipeline.pipe(browserSync.reload({
    stream: true
  }));
});

gulp.task('styles', function() {
  var pipeline = gulp.src(config.styles.source);
  var sassOpts = production ? {outputStyle: 'compressed'} : {};

  if (!production) {
    pipeline = pipeline.pipe(sourcemaps.init());
  }

  pipeline = pipeline.pipe(sass(sassOpts).on('error', sass.logError))
  .on('error', handleError)
  .pipe(prefix('last 2 versions', 'Chrome 34', 'Firefox 28', 'iOS 7'));

  if (!production) {
    pipeline = pipeline.pipe(sourcemaps.write('.'));
  }

  pipeline = pipeline.pipe(gulp.dest(config.styles.destination));

  if (production) {
    return pipeline;
  }

  return pipeline.pipe(browserSync.stream({
    match: '**/*.css'
  }));
});

gulp.task('assets', function() {
  return gulp.src(config.assets.source)
    .pipe(gulp.dest(config.assets.destination));
});

gulp.task('fonts', function() {
  return gulp.src('./node_modules/bootstrap-sass/assets/fonts/bootstrap/*')
    .pipe(gulp.dest('./public/fonts/bootstrap'));
});

gulp.task('server', function() {
  var proxyOptions = url.parse('http://localhost:8084/IOAPI');
  proxyOptions.route = '/IOAPI';
  return browserSync({
    open: false,
    port: 9001,
    notify: false,
    ghostMode: false,
    server: {
      baseDir: config.destination,
      middleware: [proxy(proxyOptions)]
    }
  });
});

gulp.task('watch', function() {

  ['templates', 'styles', 'assets', 'translations'].forEach(function(watched) {
    watch(config[watched].watch, function() {
      gulp.start(watched);
    });
  });

  var bundle = watchify(browserify(browserifyConfig));

  bundle.on('update', function() {
    var build = bundle.bundle()
      .on('error', handleError)
      .pipe(source(config.scripts.filename));

    build.pipe(gulp.dest(config.scripts.destination))
    .pipe(duration('Rebundling browserify bundle'))
    .pipe(browserSync.reload({stream: true}));
  }).emit('update');
});

gulp.task('pot', function () {
    return gulp.src(['src/**/*.html', 'src/**/*.js'])
        .pipe(gettext.extract('template.pot'))
        .pipe(gulp.dest('po/'));
});

gulp.task('translations', function () {
    return gulp.src(config.translations.source)
        .pipe(gettext.compile({
            format: 'json'
        }))
        .pipe(gulp.dest(config.translations.destination));
});

gulp.task('example-data', function() {
  require('./examples/loadExamples');
});

var buildTasks = ['templates', 'styles', 'assets', 'fonts', 'translations'];

gulp.task('revision', buildTasks.concat(['scripts']), function() {
  return gulp.src(config.revision.source, {base: config.revision.base})
    .pipe(rev())
    .pipe(gulp.dest(config.revision.destination))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./'));
});

gulp.task('replace-revision-references', ['revision', 'templates'], function() {
  var revisions = require('./rev-manifest.json');

  var pipeline = gulp.src(config.templates.revision);

  pipeline = Object.keys(revisions).reduce(function(stream, key) {
    return stream.pipe(replace(key, revisions[key]));
  }, pipeline);

  return pipeline.pipe(gulp.dest(config.templates.destination));
});

gulp.task('build', function() {
  rimraf.sync(config.destination);
  gulp.start(buildTasks.concat(['scripts', 'revision', 'replace-revision-references']));
});

gulp.task('default', buildTasks.concat(['watch', 'server']));
