'use strict';

var gulp = require('gulp'),
    bump = require('gulp-bump'),
    debug = require('gulp-debug'),
    closurize = require('gulp-closure-compiler'),
    gjslint = require('gulp-gjslint'),
    gutil = require('gulp-util'),
    path = require('path'),
    fs = require('fs'),
    karma = require('karma').server,
    coveralls = require('gulp-coveralls'),
    minimist = require('minimist'),
    del = require('del'),
    extend = require('node.extend'),
    sequence = require('run-sequence'),
    allowedLevels = ['major', 'minor', 'patch', 'prerelease'],
    allowedEnvironments = ['production', 'development'],
    knownArgs = {
      'boolean': ['banner', 'saucelabs'],
      'string': ['env', 'level'],
      'default': {
        env: process.env.NODE_ENV || allowedEnvironments[0],
        banner: false,
        saucelabs: false,
        level: allowedLevels[2]
      },
      'alias': { e: 'env', b: 'banner', l: 'level', s: 'saucelabs' }
    };


/**
 * @typedef {Object} GulpArguments
 * @property {!boolean} banner
 * @property {!string} env
 * @property {!string} level
 * @property {!boolean} saucelabs
 */
var GulpArguments;


/** @type {GulpArguments} */
var args = minimist(process.argv.slice(2), knownArgs),
    bannerHelp = { options: {} },
    saucelabsHelp = { options: {} },
    environmentsHelp = { options: {} },
    levelsHelp = { options: {} };
var getLevel = function() {
  if (allowedLevels.indexOf(args.level) === -1) {
    args.level = knownArgs.default.level;
  }
  return args.level;
};
var getEnv = function() {
  if (allowedEnvironments.indexOf(args.env) === -1) {
    args.env = knownArgs.default.env;
  }
  return args.env;
};
var isProduction = function() {
  return getEnv() === allowedEnvironments[0];
};
levelsHelp.options['level=' + allowedLevels.join('|')] = 'Version level to increment';
environmentsHelp.options['env=' + allowedEnvironments.join('|')] = 'Kind of build to perform, defaults to production';


/**
 * @type {string}
 */
bannerHelp.options.banner = 'Prepend banner to the built file';


/**
 * @type {string}
 */
saucelabsHelp.options.saucelabs = 'Remotely execute tests on SauceLabs';


/**
 * @typedef {*} PackageJson
 * @property {!string} name
 * @property {!string} description
 * @property {!string} license
 * @property {!string} homepage
 * @property {!string} version
 * @property {!string} main
 * @property {{source: !string, example: !string}} directories
 * @property {{name: !string, email: !string}} author
 */
var PackageJson;


/** @type {PackageJson} */
var bundle = require('./package.json'),
    banner = [
      '/*',
      ' * Copyright (c) ' + new Date().getFullYear() + ', ' + bundle.author.name + ' <' + bundle.author.email + '>',
      ' * ' + bundle.main + ' - ' + bundle.description,
      ' * @version ' + bundle.version,
      ' * @link ' + bundle.homepage,
      ' * @license ' + bundle.license,
      ' */'
    ].join('\n');

gulp = require('gulp-help')(gulp, {
  description: 'Display this help text'
});


/**
 * @type {{
 * compiler: string,
 * prefixes: {dev: !string},
 * output: {minified: !string, sourcemap: !string},
 * externs: string[],
 * sources: string[]
 * }}
 */
var settings = {
  compiler: 'bower_components/closure-compiler/compiler.jar',
  prefixes: {
    dev: 'dev.'
  },
  output: {
    minified: bundle.main,
    sourcemap: bundle.main + '.map'
  },
  externs: [
    'bower_components/closure-angularjs-externs/index.js',
    'bower_components/closure-angularjs-q_templated-externs/index.js',
    'bower_components/closure-angularjs-http-promise_templated-externs/index.js'
  ],
  sources: [
    bundle.directories.source + '/*.js'
  ]
};

gulp.task('version', 'Print the library version', [], function() {
  return gutil.log('Library', gutil.colors.magenta(bundle.name) + ',', gutil.colors.magenta(bundle.version));
});

gulp.task('bump', 'Bump version up for a new release', function() {
  return gulp.src(['./bower.json', 'package.json'])
      .pipe(bump({ type: getLevel() }))
      .pipe(gulp.dest('./'));
}, levelsHelp);

gulp.task('clean', 'Clean build directory', function(cb) {
  var files = ['npm-debug.log', (isProduction() ? '' : settings.prefixes.dev) + settings.output.minified];
  if (!isProduction()) {
    files.push(settings.prefixes.dev + settings.output.sourcemap);
  }
  del(files, cb);
}, environmentsHelp);

gulp.task('lint', 'Lint JS source files', [], function() {
  var lintOptions = {
    flags: [
      '--flagfile=gjslint.conf'
    ]
  };
  return gulp.src(settings.sources)
      .pipe(debug({ title: 'Lint' }))
      .pipe(gjslint(lintOptions))
      .pipe(gjslint.reporter('console'), { fail: true });
});

gulp.task('compile', false, [], function() {
  var flags = {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    language_in: 'ECMASCRIPT3',
    angular_pass: true,
    formatting: 'SINGLE_QUOTES',
    externs: settings.externs,
    generate_exports: true,
    closure_entry_point: 'leodido.module.Luhn',
    only_closure_dependencies: true,
    output_wrapper: (args.banner ? banner + '\n' : '') + '(function(){%output%})();',
    define: [
      'leodido.constant.Luhn.DEBUG=' + (isProduction() ? 'false' : 'true')
    ],
    warning_level: 'VERBOSE'
  };
  if (!isProduction()) {
    var sourcemap = settings.prefixes.dev + settings.output.sourcemap;
    flags.create_source_map = sourcemap;
    flags.output_wrapper += '\n//# sourceMappingURL=' + sourcemap;
  }
  gulp.src(settings.sources)
      .pipe(debug({ title: 'Input' }))
      .pipe(closurize({
        compilerPath: settings.compiler,
        fileName: (isProduction() ? '' : settings.prefixes.dev) + settings.output.minified,
        compilerFlags: flags
      }));
});

gulp.task('build', 'Build the library', [], function(cb) {
  sequence(['clean', 'lint'], 'compile', cb);
}, {
  options: extend(bannerHelp.options, environmentsHelp.options)
});

gulp.task('karma', 'Run karma tests', [], function(done) {
  var config = {
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: true
  };
  if (args.saucelabs) {
    // Check that credentials exists
    if (!process.env.SAUCE_USERNAME && !process.env.SAUCE_ACCESS_KEY) {
      // Try to fallback to locale saucelabs credential file
      if (!fs.existsSync('saucelabs.local.json')) {
        gutil.log('Create environment variables or a saucelabs.local.json with your credentials.');
        process.exit(1);
      } else {
        var saucelabsCredentials = require('./saucelabs.local');
        process.env.SAUCE_USERNAME = saucelabsCredentials.username;
        process.env.SAUCE_ACCESS_KEY = saucelabsCredentials.accessKey;
      }
    }
    // Augment karma config for saucelabs
    var saucelabsConfig = require('./saucelabs.config.json');
    config.browserNoActivityTimeout = saucelabsConfig.timeout;
    config.customLaunchers = saucelabsConfig.launchers;
    config.sauceLabs = {
      testName: saucelabsConfig.name,
      recordScreenshots: saucelabsConfig.screenshots,
      startConnect: true
    };
    config.captureTimeout = 0;
    config.browsers = Object.keys(saucelabsConfig.launchers);
    if (process.env.TRAVIS) {
      config.sauceLabs.startConnect = false;
      config.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER;
      config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
    }
  }
  karma.start(config, done);
}, saucelabsHelp);

gulp.task('coveralls', false, [], function() {
  return gulp.src('coverage/lcov.info')
      .pipe(coveralls());
});
