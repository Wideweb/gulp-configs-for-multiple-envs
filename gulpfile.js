var gulp    = require('gulp'),
    uglify  = require('gulp-uglify'),
    gutil   = require('gulp-util'),
    config  = require('./config');
    inject  = require('gulp-inject');
    clean   = require('gulp-clean');
    cssnano = require('gulp-cssnano');
    concat  = require('gulp-concat');
    b2v     = require('buffer-to-vinyl');
    gulpif  = require('gulp-if');
    addsrc  = require('gulp-add-src');
    runSequence  = require('run-sequence');
    gulpNgConfig = require('gulp-ng-config');

var _ = require('lodash'); 

gulp.task('clean', function () {
    return gulp
        .src(_.values(config.paths.dest))
        .pipe(clean());
});

gulp.task('js', ['constants'], function() {
    return gulp
        .src(config.paths.src.js)
        .pipe(gulpif(config.run.js.uglify, addsrc(config.paths.dest.js + '/constants.js')))
        .pipe(gulpif(config.run.js.uglify, concat('script.js')))
        .pipe(gulpif(config.run.js.uglify, uglify(config.plugin.js.uglify)))
        .pipe(gulp.dest(config.paths.dest.js));
});

gulp.task('constants', function() {
    return b2v
        .stream(new Buffer(JSON.stringify(config.constants)), 'constants.js')
        .pipe(gulpNgConfig('app', {
            constants: config.constants,
            createModule: false,
            wrap: true,
            pretty: true
        }))
        .pipe(gulp.dest(config.paths.dest.js));
});

gulp.task('clean-constants', function () {
    return gulp
        .src(config.paths.dest.js + '/constants.js')
        .pipe(clean());
});

gulp.task('js&constants', function(callback) {
    //'if constants.js file is attached to the script.js then it will be removed from the destination folder;
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
        .pipe(gulpif(config.run.css.cssnano, concat('styles.css')))
        .pipe(gulpif(config.run.css.cssnano, cssnano()))
        .pipe(gulp.dest(config.paths.dest.css));
});

gulp.task("libs",function() {
    return gulp
        .src(config.paths.src.libs)
        .pipe(gulp.dest(config.paths.dest.libs));
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