var gulp    = require('gulp'),
    uglify  = require('gulp-uglify'),
    gutil   = require('gulp-util'),
    config  = require('./config');
    file    = require('gulp-file'),
    inject  = require('gulp-inject');
    clean   = require('gulp-clean');
    cssnano = require('gulp-cssnano');
    concat  = require('gulp-concat');
    runSequence = require('run-sequence');

var _ = require('lodash'); 

gulp.task('clean', function () {
    return gulp
        .src(_.values(config.paths.dest))
        .pipe(clean());
});

gulp.task('js', ['constants'], function() {
    return gulp
        .src([config.paths.src.js, config.paths.dest.js + '/constants.js'])
        .pipe(config.run.js.uglify ? concat('script.js') : gutil.noop())
        .pipe(config.run.js.uglify ? uglify(config.plugin.js.uglify) : gutil.noop())
        .pipe(gulp.dest(config.paths.dest.js));
});

gulp.task('js&constants', function(callback) {
    if(config.run.js.uglify){
        return runSequence('constants', 'js', 'clean-constants', callback);
    }

    return runSequence('constants', 'js', callback);
});

gulp.task('templates', function() {
    return gulp
        .src([config.paths.src.templates, '!' + config.paths.src.html])
        .pipe(gulp.dest(config.paths.dest.templates));
});

gulp.task('css', function() {
    return gulp
        .src(config.paths.src.css)
        .pipe(config.run.css.cssnano ? concat('styles.css') : gutil.noop())
        .pipe(config.run.css.cssnano ? cssnano() : gutil.noop())
        .pipe(gulp.dest(config.paths.dest.css));
});

gulp.task("libs",function() {
    return gulp
        .src(config.paths.src.libs)
        .pipe(gulp.dest(config.paths.dest.libs));
});

gulp.task('constants', function() {
    var constantsObjString = '{';

    _.map(config.constants, function(value, key) {
        if (typeof value === 'string') {
            value = '\'' + value + '\'';
        }
        constantsObjString += '\n\t\t ' + key + ': ' + value + ',';
    });
    
    // Remove the last comma
    constantsObjString = constantsObjString.substring(0, constantsObjString.length - 1);
    constantsObjString += '\n }';

    var codeString = 
        '(function(){' +
        '\n\t angular.module(\'constants\', []).constant(\'constants\', ' + constantsObjString + ');' +
        '\n})();';

    //calls stream.end() to be used at the beginning of your pipeline in place of gulp.src(). Default: false.
    return file('constants.js', codeString, { src: true })
        .pipe(gulp.dest(config.paths.dest.js));
});

gulp.task('clean-constants', function () {
    return gulp
        .src(config.paths.dest.js + '/constants.js')
        .pipe(clean());
});

 gulp.task('inject-vendor', ['libs', 'templates', 'css', 'js&constants'], function(){
    var target = gulp.src(config.paths.src.html);
    var sources = gulp.src([
        config.paths.dest.js + '/**/*.js', 
        config.paths.dest.libs + '/**/*.js', 
        config.paths.dest.css + '/**/*.css',
    ], {read: false});

    return target
        .pipe(inject(sources))
        .pipe(gulp.dest(config.paths.dest.html));
 });

gulp.task('default', ['libs', 'templates', 'css', 'js&constants', 'inject-vendor'])