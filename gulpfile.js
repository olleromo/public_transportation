"use strict";

var gulp = require('gulp');
var browserify = require('browserify'); // Bundles JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); //Concatenates files
var lint = require('gulp-eslint'); //Lint JS files, including JSX
var sass = require('gulp-sass'); //sass
var browserSync = require('browser-sync').create();
var jasmine = require('gulp-jasmine-phantom');
var modernizr = require('gulp-modernizr');
var touch = require("touch");


var config = {
	paths: {
	    html: './src/html/*.html',
	    js: './src/js/*.js',
            mainJs: './src/js/app.js',
	    images: './src/images/*.*',
	    dist: './resources/public',
            sass: './src/sass/*.scss'
	}
};

gulp.task('modernizr', function() {
  gulp.src('./js/*.js')
    .pipe(modernizr())
    .pipe(gulp.dest("build/"))
});

gulp.task('tests', function () {
    gulp.src('tests/spec/extraSpec.js')
        .pipe(jasmine({
            integration: true,
            vendor: 'js/**/*.js'
        }));
});

gulp.task('serve', function () {
    browserSync.init({
        proxy: 'localhost:3000'
    });
    gulp.watch('./resources/public/css/*.css').on('change', browserSync.reload);
    gulp.watch('./resources/public/js/*.js').on('change', browserSync.reload);
    gulp.watch('./src/clj/*.clj').on('change', browserSync.reload);
});

gulp.task('html', function() {
    gulp.watch(config.paths.html).on('change', function(){
        touch('./src/clj/server.clj');
    });
});

gulp.task('js', function() {
    browserify(config.paths.mainJs)
	.bundle()
	.on('error', console.error.bind(console))
	.pipe(source('app.js'))
	.pipe(gulp.dest(config.paths.dist + '/js'));
    // console.log("js done");
});

gulp.task('sass', function() {
    gulp.src(config.paths.sass)
        .pipe(sass({
            includePaths: ['./node_modules/foundation-sites/scss']}))
        .pipe(gulp.dest(config.paths.dist + '/css'));
});

// Migrates images to dist folder
// Note that I could even optimize my images here
gulp.task('images', function () {
    gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/images'));

    //publish favicon
    gulp.src('./src/favicon.ico')
        .pipe(gulp.dest(config.paths.dist));
});

gulp.task('lint', function() {
	return gulp.src(config.paths.js)
		.pipe(lint({config: 'eslint.config.json'}))
		.pipe(lint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js', 'lint']);
    gulp.watch(config.paths.sass, ['sass']);
    gulp.watch('./src/clj/*.clj', ['clj']);
});

// gulp.task('default', ['html', 'js', 'sass', 'images', 'lint', , 'watch']); // 
gulp.task('default', ['html', 'js', 'sass', 'images', 'lint', 'watch', 'serve']);